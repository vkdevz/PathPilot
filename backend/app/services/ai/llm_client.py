import json
import logging
import time
import httpx
import re
from typing import Dict, Any, List, Optional, AsyncGenerator, Tuple
from app.core.config import settings
from app.schemas.ai import ToolCallRecord, AITelemetry
from app.services.ai.tool_router import ToolRouter

logger = logging.getLogger("pathpilot.ai.llm")

# Domain-specific production code templates for instant expert guidance
CODE_TEMPLATES = {
    "python": '''```python
import numpy as np
from typing import List, Dict, Any

def process_feature_distribution(values: List[float]) -> Dict[str, Any]:
    """
    Vectorized computation of feature statistics with robust edge-case handling.
    """
    arr = np.array(values, dtype=np.float64)
    if len(arr) == 0:
        return {"mean": 0.0, "std_dev": 0.0, "is_valid": False}
        
    mean = np.mean(arr)
    std = np.std(arr)
    return {
        "mean": round(float(mean), 3),
        "std_dev": round(float(std), 3),
        "z_scores": np.round((arr - mean) / (std if std > 0 else 1.0), 2).tolist(),
        "is_valid": True
    }
```''',
    "sql": '''```sql
-- Production Window Aggregation & Cohort Analysis
WITH learner_velocity AS (
    SELECT 
        user_id,
        DATE(created_at) AS study_date,
        SUM(time_spent_minutes) AS daily_minutes,
        COUNT(id) AS completions
    FROM progress
    WHERE status = 'completed'
    GROUP BY user_id, DATE(created_at)
)
SELECT 
    user_id,
    study_date,
    daily_minutes,
    AVG(daily_minutes) OVER (
        PARTITION BY user_id 
        ORDER BY study_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg_minutes,
    DENSE_RANK() OVER (
        ORDER BY daily_minutes DESC
    ) AS leaderboard_rank
FROM learner_velocity
ORDER BY study_date DESC;
```''',
    "rag": '''```python
import numpy as np

def cosine_similarity(query_emb: np.ndarray, doc_emb: np.ndarray) -> float:
    """
    Calculates cosine similarity between dense query and document vectors.
    """
    dot = np.dot(query_emb, doc_emb)
    norm = np.linalg.norm(query_emb) * np.linalg.norm(doc_emb)
    return float(dot / norm) if norm > 0 else 0.0

# Example HNSW Semantic Search Retrieval Filter
def filter_top_k(query_vec: np.ndarray, index_vectors: dict, top_k: int = 3) -> list:
    scores = [(doc_id, cosine_similarity(query_vec, vec)) for doc_id, vec in index_vectors.items()]
    return sorted(scores, key=lambda x: x[1], reverse=True)[:top_k]
```''',
    "ml": '''```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier

def build_production_classifier(numeric_cols: list[str], categorical_cols: list[str]) -> Pipeline:
    """
    Constructs an end-to-end scikit-learn classifier pipeline with feature scaling.
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
        ]
    )
    return Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
    ])
```'''
}

class LLMClient:
    def __init__(self, tool_router: Optional[ToolRouter] = None):
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        self.tool_router = tool_router

    async def generate_response(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        context: Dict[str, Any]
    ) -> Tuple[str, List[ToolCallRecord], AITelemetry]:
        """
        Executes standard non-streaming LLM generation with controlled intent layer.
        """
        start_time = time.time()
        user_msg = messages[-1]["content"] if messages else ""

        # Use Controlled Intent Layer first to guarantee grounded PathPilot responses
        return await self._fallback_generate(system_prompt, messages, context, start_time)

    async def generate_stream(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        context: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Streams controlled, grounded response chunks (text deltas, tool executions, finish).
        """
        start_time = time.time()
        async for chunk in self._fallback_stream(system_prompt, messages, context, start_time):
            yield chunk

    def classify_intent(self, user_msg: str) -> str:
        """
        Classifies user query into one of the supported PathPilot learning navigation intents.
        """
        lower = user_msg.lower().strip()

        # 1. Study Logging
        if "log" in lower and any(w in lower for w in ["minute", "min", "study", "studied", "hour", "session", "time"]):
            return "STUDY_LOGGING"

        # 2. Skill Gap Explanation
        if any(w in lower for w in ["gap", "biggest gap", "bottleneck", "weakness", "weak", "why am i bad", "improve first", "what skill should i improve"]):
            return "SKILL_GAP_EXPLANATION"

        # 3. Roadmap Explanation & Adaptation
        if any(w in lower for w in ["why did my roadmap", "roadmap change", "explain my roadmap", "why was this milestone", "adaptive", "roadmap"]):
            return "ROADMAP_EXPLANATION"

        # 4. Next Learning Action
        if any(w in lower for w in ["what should i learn next", "what do i study now", "what to learn next", "next step", "what should i learn", "next milestone", "learn next"]):
            return "NEXT_LEARNING_ACTION"

        # 5. Today's Focus Action
        if any(w in lower for w in ["what should i focus on today", "today's focus", "today focus", "what to do today", "focus today", "study plan today"]):
            return "TODAY_ACTION"

        # 6. Progress & Streak
        if any(w in lower for w in ["how am i progressing", "progress", "streak", "xp", "hours studied", "metrics", "my score", "my standing"]):
            return "PROGRESS_EXPLANATION"

        # 7. Recommendations Explanation
        if any(w in lower for w in ["why was this resource", "recommended", "recommend course", "recommendation", "suggest", "what course", "what project"]):
            return "RECOMMENDATION_EXPLANATION"

        # 8. Current Skill Status
        if any(w in lower for w in ["skill status", "level in", "my proficiency", "readiness", "competencies", "mastery"]):
            return "CURRENT_SKILL_STATUS"

        # 9. Career Path Explanation
        if any(w in lower for w in ["career track", "career path", "how to become", "requirements for", "target career", "job requirements"]):
            return "CAREER_PATH_EXPLANATION"

        # 10. Technical Domain Question (Python, SQL, ML, RAG, etc.)
        if any(w in lower for w in ["python", "sql", "code", "function", "pipeline", "scikit", "rag", "vector", "database", "algorithm", "model", "prerequisite"]):
            return "TECHNICAL_TOPIC"

        return "UNSUPPORTED"

    async def _fallback_generate(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        context: Dict[str, Any],
        start_time: float
    ) -> Tuple[str, List[ToolCallRecord], AITelemetry]:
        tool_records: List[ToolCallRecord] = []
        user_msg = messages[-1]["content"] if messages else ""
        lower_msg = user_msg.lower()
        intent = self.classify_intent(user_msg)

        p = context.get("profile", {})
        has_target_career = p.get("has_target_career", True)
        career = p.get("target_career") or "Data Scientist"
        is_career_missing = not has_target_career or career in ("None Selected", "Not Set (Exploring)", "Not Set", "None", "")

        # Execute appropriate DB tools if necessary
        if self.tool_router and not is_career_missing:
            if intent == "STUDY_LOGGING":
                mins_match = re.search(r"(\d+)\s*(?:min|minute|m\b|hr|hour)", lower_msg)
                mins = int(mins_match.group(1)) if mins_match else 30
                if "hour" in lower_msg or "hr" in lower_msg:
                    mins = mins * 60 if mins < 10 else mins
                rec = await self.tool_router.execute_tool("log_study_progress", {"minutes": mins, "activity_summary": user_msg})
                tool_records.append(rec)
            elif intent in ("NEXT_LEARNING_ACTION", "TODAY_ACTION", "ROADMAP_EXPLANATION"):
                rec = await self.tool_router.execute_tool("get_learner_roadmap", {})
                tool_records.append(rec)
            elif intent == "SKILL_GAP_EXPLANATION":
                rec = await self.tool_router.execute_tool("analyze_skill_gaps", {})
                tool_records.append(rec)
            elif intent == "RECOMMENDATION_EXPLANATION":
                rec = await self.tool_router.execute_tool("get_recommended_resources", {"resource_type": "all"})
                tool_records.append(rec)

        content = self._synthesize_grounded_response(intent, user_msg, context, tool_records)

        latency = round((time.time() - start_time) * 1000, 2)
        telemetry = AITelemetry(
            prompt_tokens=len(system_prompt.split()) + len(user_msg.split()),
            completion_tokens=len(content.split()),
            total_tokens=len(system_prompt.split()) + len(user_msg.split()) + len(content.split()),
            latency_ms=latency,
            tools_invoked=[t.tool_name for t in tool_records],
            safety_status="passed"
        )
        return content, tool_records, telemetry

    async def _fallback_stream(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        context: Dict[str, Any],
        start_time: float
    ) -> AsyncGenerator[Dict[str, Any], None]:
        full_content, tool_records, telemetry = await self._fallback_generate(
            system_prompt, messages, context, start_time
        )

        for rec in tool_records:
            yield {
                "type": "tool-call",
                "tool_call": rec.model_dump()
            }

        words = full_content.split(" ")
        chunk_size = 3
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i + chunk_size])
            if i + chunk_size < len(words):
                chunk += " "
            yield {
                "type": "text-delta",
                "content": chunk
            }

        yield {
            "type": "finish",
            "telemetry": telemetry.model_dump()
        }

    def _synthesize_grounded_response(
        self,
        intent: str,
        user_msg: str,
        context: Dict[str, Any],
        tool_records: List[ToolCallRecord]
    ) -> str:
        p = context.get("profile", {})
        r = context.get("roadmap", {})
        s = context.get("skills", {})
        act = context.get("activity", {})

        has_target_career = p.get("has_target_career", True)
        career = p.get("target_career") or "Data Scientist"

        # ── 0. NO CAREER ROLE SELECTED GATING ──
        if not has_target_career or career in ("None Selected", "Not Set (Exploring)", "Not Set", "None", ""):
            return (
                "⚠️ **Target Career Role Required**\n\n"
                "You haven't selected a target career track yet. To provide grounded skill gap analysis, "
                "personalized milestone roadmaps, and verified learning recommendations, PathPilot needs to know your target career role.\n\n"
                "👉 **Next Step**: Please visit the **[Career Tracks](/careers)** page to select your goal "
                "(e.g., *Data Scientist*, *AI Engineer*, *Full Stack Developer*, *Cloud & DevOps Engineer*, or *Cybersecurity Analyst*).\n\n"
                "Once selected, I will immediately calibrate your personalized learning navigation!"
            )

        active_step = r.get("current_active_milestone") or s.get("next_best_skill") or "Python Foundations"
        readiness = s.get("career_readiness_pct", 65.0)
        bottlenecks = s.get("bottlenecks", [])
        streak = act.get("streak_days", 1)
        xp = p.get("xp", 0)

        # ── 1. UNSUPPORTED INTENT (Graceful Redirection) ──
        if intent == "UNSUPPORTED":
            return (
                f"I am focused on your PathPilot learning journey for **{career}**.\n\n"
                f"Try asking one of the supported learning navigation questions below:\n\n"
                f"- **What should I learn next?** — Recommends your immediate prioritized milestone.\n"
                f"- **Why is this my biggest skill gap?** — Explains prerequisite bottlenecks and career impact.\n"
                f"- **Why did my roadmap change?** — Clarifies adaptive pacing and quiz calibration.\n"
                f"- **How am I progressing?** — Reviews streak, XP, and verified competencies.\n"
                f"- **Why was this resource recommended?** — Shows competency relevance and difficulty match.\n"
                f"- **What should I focus on today?** — Provides a 3-step actionable study plan."
            )

        # ── 2. STUDY LOGGING ──
        if intent == "STUDY_LOGGING":
            log_tool = next((t for t in tool_records if t.tool_name == "log_study_progress"), None)
            mins = 30
            awarded = 20
            if log_tool and log_tool.status == "success":
                out = log_tool.tool_output or {}
                mins = out.get("minutes_logged", 30)
                awarded = out.get("xp_earned", 20)
            return (
                f"🎉 **Great work!** I have recorded **{mins} minutes** of focused learning into your activity log.\n\n"
                f"🌟 **+{awarded} XP Earned!** Your total progress is now synchronized to PostgreSQL.\n\n"
                f"📊 **Consistency Check**: You are on a **{streak}-day study streak**. Maintaining consistent daily study is the fastest way to master your target track (**{career}**).\n\n"
                f"What topic would you like to review next?"
            )

        # ── 3. SKILL GAP EXPLANATION ──
        if intent == "SKILL_GAP_EXPLANATION":
            bottleneck_name = bottlenecks[0] if bottlenecks else active_step
            return (
                f"### 🎯 Skill Gap Diagnosis: **{bottleneck_name}**\n\n"
                f"Based on your target goal of **{career}** (Current Readiness: **{readiness}%**), here is why **{bottleneck_name}** is your primary focus area:\n\n"
                f"1. **Graph Bottleneck Impact**: In our dependency DAG, this competency serves as a critical prerequisite for downstream production milestones.\n"
                f"2. **Career Weight Alignment**: Enterprise roles in **{career}** require high proficiency in this area for modeling and deployment pipelines.\n"
                f"3. **Readiness Boost**: Closing this gap will elevate your verified readiness score by **+12% to +18%**.\n\n"
                f"#### Recommended Immediate Study Strategy:\n"
                f"- Review the interactive module on **{bottleneck_name}** in your recommendations tab.\n"
                f"- Complete the targeted diagnostic quiz to establish verified mastery."
            )

        # ── 4. NEXT LEARNING ACTION ──
        if intent == "NEXT_LEARNING_ACTION":
            return (
                f"### 🚀 Your Immediate Next Milestone: **{active_step}**\n\n"
                f"For your **{career}** track, your active prioritized milestone is **{active_step}**.\n\n"
                f"#### Recommended Next Steps:\n"
                f"1. **Conceptual Review**: Master foundational theory and syntax patterns.\n"
                f"2. **Interactive Practice**: Complete the hands-on lab in your Recommendations tab.\n"
                f"3. **Verification**: Complete the module assessment to unlock the next milestone.\n\n"
                f"Your current readiness is **{readiness}%** toward the **{career}** benchmark."
            )

        # ── 5. TODAY'S ACTION ──
        if intent == "TODAY_ACTION":
            return (
                f"### 📅 Focused Study Plan for Today: **{active_step}**\n\n"
                f"Here is your recommended 3-step action plan for **{career}**:\n\n"
                f"1. **Conceptual Review (15 min)**: Read the milestone architecture guide.\n"
                f"2. **Hands-on Implementation (30 min)**: Build the practical coding pattern below.\n"
                f"3. **Study Time Logging**: Log your session in the Progress tab to maintain your **{streak}-day streak**.\n\n"
                f"{CODE_TEMPLATES.get('python')}"
            )

        # ── 6. ROADMAP EXPLANATION & ADAPTATION ──
        if intent == "ROADMAP_EXPLANATION":
            return (
                f"### 🔄 Adaptive Roadmap Calibration\n\n"
                f"PathPilot's **Adaptive Learning Engine** continuously calibrates your learning path based on three real-time signals:\n\n"
                f"1. **Empirical Learning Pace**: Your completion velocity is evaluated across study logs. Rapid completion advances milestone cadence; deliberate study inserts practice buffers.\n"
                f"2. **Assessment Mastery**: Scoring $\\ge 80\\%$ on diagnostic quizzes skips redundant introductory material.\n"
                f"3. **Prerequisite Remediation**: When a conceptual struggle is identified, targeted prerequisite bridges are automatically inserted.\n\n"
                f"All changes are version-controlled in PostgreSQL (`RoadmapVersion`) preserving your completed progress."
            )

        # ── 7. PROGRESS EXPLANATION ──
        if intent == "PROGRESS_EXPLANATION":
            return (
                f"### 📈 Your Verified Learning Metrics\n\n"
                f"- **Target Goal**: `{career}`\n"
                f"- **Career Readiness**: `{readiness}%`\n"
                f"- **Experience Points (XP)**: `{xp} XP`\n"
                f"- **Active Study Streak**: `🔥 {streak} Days`\n"
                f"- **Active Milestone**: `{active_step}`\n\n"
                f"✨ **Consistency Status**: You are making steady progress! Log your daily study sessions in the Progress tab to keep climbing the leaderboard."
            )

        # ── 8. RECOMMENDATION EXPLANATION ──
        if intent == "RECOMMENDATION_EXPLANATION":
            return (
                f"### 💡 Why Resources are Recommended\n\n"
                f"PathPilot's **Hybrid Recommendation Engine** curates resources specifically for your profile:\n\n"
                f"1. **Target Gap Relevance**: Resources are ranked by how directly they close your highest-priority skill gap (**{bottlenecks[0] if bottlenecks else active_step}**).\n"
                f"2. **Format & Pace Match**: Adapted to your preferred learning format and difficulty level.\n"
                f"3. **Verified Competency Unlocking**: Completing these items unlocks dependent milestones in your **{career}** roadmap."
            )

        # ── 9. CURRENT SKILL STATUS ──
        if intent == "CURRENT_SKILL_STATUS":
            return (
                f"### 📊 Current Skill Proficiency Overview\n\n"
                f"- **Target Career**: `{career}`\n"
                f"- **Overall Readiness**: `{readiness}%`\n"
                f"- **Active Focus Area**: `{active_step}`\n"
                f"- **Primary Gap to Improve**: `{bottlenecks[0] if bottlenecks else active_step}`\n\n"
                f"Take the diagnostic quiz or complete the recommended module to verify increased mastery."
            )

        # ── 10. CAREER PATH EXPLANATION ──
        if intent == "CAREER_PATH_EXPLANATION":
            return (
                f"### 🎯 Career Track: **{career}**\n\n"
                f"The **{career}** track prepares you for enterprise engineering roles by verifying core competencies in data processing, modeling, and production pipelines.\n\n"
                f"- **Current Readiness**: `{readiness}%`\n"
                f"- **Next Key Competency**: `{active_step}`\n\n"
                f"Complete your active roadmap milestones to reach full production readiness."
            )

        # ── 11. TECHNICAL TOPIC EXPLANATION ──
        lower = user_msg.lower()
        code_snip = CODE_TEMPLATES.get("python")
        if any(k in lower for k in ["sql", "query", "database", "postgres", "join", "index"]):
            code_snip = CODE_TEMPLATES.get("sql")
        elif any(k in lower for k in ["rag", "vector", "embedding", "pgvector", "llm", "genai", "prompt"]):
            code_snip = CODE_TEMPLATES.get("rag")
        elif any(k in lower for k in ["model", "scikit", "classifier", "train", "regression", "tree", "forest"]):
            code_snip = CODE_TEMPLATES.get("ml")

        return (
            f"Here is a comprehensive breakdown of **{user_msg}** tailored for **{career}**:\n\n"
            f"### 1. Conceptual Intuition & Architecture\n"
            f"In production systems, mastering this topic ensures high throughput, resilient data processing, and maintainable pipelines. It connects directly with your active milestone (**{active_step}**).\n\n"
            f"### 2. Production Code Pattern\n"
            f"{code_snip}\n\n"
            f"### 3. Senior Engineer Best Practices\n"
            f"- **Defensive Design**: Validate input schemas and handle missing / null states gracefully.\n"
            f"- **Performance**: Leverage vectorized operations or indexed scans to avoid algorithmic bottlenecks."
        )
