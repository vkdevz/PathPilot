import logging
import time
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.skill_repository import SkillRepository
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.resource_repository import ResourceRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.career_repository import CareerRepository
from app.models.progress import Progress
from app.schemas.ai import ToolCallRecord

logger = logging.getLogger("pathpilot.ai.tools")

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_learner_profile",
            "description": "Fetch the authenticated learner's profile, target career track, XP, streak, and preferences from PostgreSQL.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_learner_roadmap",
            "description": "Fetch the learner's active learning path roadmap, including all sequential milestones, completion statuses, and next steps.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_skill_details_and_prerequisites",
            "description": "Fetch skill taxonomy information, difficulty level, category, and direct prerequisite dependency graph for a specific skill.",
            "parameters": {
                "type": "object",
                "properties": {
                    "skill_name_or_slug": {
                        "type": "string",
                        "description": "The name or slug of the skill (e.g., 'python-ds', 'Python for Data Science', 'Applied Statistics', 'machine-learning')"
                    }
                },
                "required": ["skill_name_or_slug"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_diagnostic_assessment_explanation",
            "description": "Retrieve diagnostic assessment questions, correct answer rationale, and topic breakdowns for a career track.",
            "parameters": {
                "type": "object",
                "properties": {
                    "career_slug": {
                        "type": "string",
                        "description": "The career slug to inspect diagnostic questions for (e.g. 'data-scientist', 'ai-engineer')"
                    },
                    "skill_name": {
                        "type": "string",
                        "description": "Optional skill name to filter specific questions"
                    }
                },
                "required": ["career_slug"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_recommended_resources",
            "description": "Fetch personalized learning resources from the hybrid recommendation engine matched to the learner's goal, skill gaps, and active roadmap.",
            "parameters": {
                "type": "object",
                "properties": {
                    "resource_type": {
                        "type": "string",
                        "enum": ["all", "course", "project", "lab", "practice"],
                        "description": "Filter by resource format type"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of recommendations to return (default 4)"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_next_best_learning_action",
            "description": "Retrieve the single highest-priority #1 personalized next learning action for the learner based on hybrid gap scoring and active roadmap milestone.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "log_study_progress",
            "description": "Log study activity time (in minutes) for the learner and award XP in PostgreSQL.",
            "parameters": {
                "type": "object",
                "properties": {
                    "minutes": {
                        "type": "integer",
                        "description": "Number of minutes studied (e.g. 15, 30, 45, 60)"
                    },
                    "activity_summary": {
                        "type": "string",
                        "description": "Brief summary of what was studied or practiced"
                    }
                },
                "required": ["minutes"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_learner_skill_gaps",
            "description": "Fetch the complete intelligent skill gap analysis for the learner, including career readiness percentage, bottleneck skills, unblocking prerequisites, and the authoritative Next Best Skill.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_skill_prerequisites_graph",
            "description": "Traverse the full prerequisite DAG for a skill, returning direct prerequisites, transitive ancestors, downstream unlocked skills, and bottleneck status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "skill_name_or_slug": {
                        "type": "string",
                        "description": "The skill name or slug to inspect (e.g. 'stats-ds', 'ml-foundations', 'deep-learning')"
                    }
                },
                "required": ["skill_name_or_slug"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "semantic_search_learning_resources",
            "description": "Search learning resources using pgvector semantic similarity search with optional difficulty, format, or duration filters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language search topic or concept"
                    },
                    "difficulty": {
                        "type": "string",
                        "enum": ["Beginner", "Intermediate", "Advanced"],
                        "description": "Optional difficulty level"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of resources to retrieve (default 3)"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_learner_adaptive_state",
            "description": "Fetch the learner's complete real-time adaptive state, including skill proficiencies, mastery states, struggle signals, learning pace, and unblocking priorities.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_adaptation_history",
            "description": "Retrieve the chronological audit log of adaptation events (e.g. why the roadmap changed, when mastery was detected, difficulty adjustments).",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Max events to retrieve (default 10)"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "explain_recent_adaptation",
            "description": "Retrieve the specific evidence and pedagogical reason behind the most recent roadmap or difficulty change.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]

class ToolRouter:
    def __init__(self, db: AsyncSession, user_id: str):
        self.db = db
        self.user_id = user_id
        self.user_repo = UserRepository(db)
        self.learning_path_repo = LearningPathRepository(db)
        self.skill_repo = SkillRepository(db)
        self.assessment_repo = AssessmentRepository(db)
        self.resource_repo = ResourceRepository(db)
        self.progress_repo = ProgressRepository(db)
        self.career_repo = CareerRepository(db)

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        return TOOL_DEFINITIONS

    async def execute_tool(self, tool_name: str, tool_input: Dict[str, Any]) -> ToolCallRecord:
        start_time = time.time()
        try:
            handler = getattr(self, f"_tool_{tool_name}", None)
            if not handler:
                raise ValueError(f"Unknown tool: {tool_name}")
            
            output = await handler(tool_input)
            exec_time = round((time.time() - start_time) * 1000, 2)
            return ToolCallRecord(
                tool_name=tool_name,
                tool_input=tool_input,
                tool_output=output,
                status="success",
                execution_time_ms=exec_time
            )
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}", exc_info=True)
            exec_time = round((time.time() - start_time) * 1000, 2)
            return ToolCallRecord(
                tool_name=tool_name,
                tool_input=tool_input,
                tool_output={"error": str(e)},
                status="error",
                execution_time_ms=exec_time
            )

    async def _tool_get_learner_profile(self, args: Dict[str, Any]) -> Dict[str, Any]:
        user = await self.user_repo.get_by_id(self.user_id)
        if not user or not user.profile:
            return {"status": "not_found", "message": "No profile found for current user"}
        
        p = user.profile
        return {
            "user_id": user.id,
            "display_name": user.display_name,
            "email": user.email,
            "target_career": p.target_career.name if p.target_career else "None",
            "experience_level": p.experience_level,
            "learning_pace": p.learning_pace,
            "weekly_hours_goal": p.weekly_hours_goal,
            "xp": p.xp,
            "streak_days": p.streak_days,
            "status": "verified"
        }

    async def _tool_get_learner_roadmap(self, args: Dict[str, Any]) -> Dict[str, Any]:
        path = await self.learning_path_repo.get_active_by_user(self.user_id)
        if not path:
            return {"status": "empty", "message": "No active learning path found. Complete diagnostic assessment to generate roadmap."}
        
        milestones = []
        for item in sorted(path.items, key=lambda x: x.step_order):
            milestones.append({
                "milestone_id": item.id,
                "step_order": item.step_order,
                "skill_name": item.skill.name if item.skill else "Unknown Skill",
                "skill_slug": item.skill.slug if item.skill else "",
                "status": item.status,
                "estimated_hours": item.estimated_hours
            })
        return {
            "career_name": path.career.name if path.career else "Career Track",
            "total_steps": len(milestones),
            "milestones": milestones,
            "status": "verified"
        }

    async def _tool_get_skill_details_and_prerequisites(self, args: Dict[str, Any]) -> Dict[str, Any]:
        query = args.get("skill_name_or_slug", "").strip()
        slug = query.lower().replace(" ", "-")
        skill = await self.skill_repo.get_by_slug(slug)
        if not skill:
            # Fallback search by all skills
            all_skills = await self.skill_repo.get_all()
            for s in all_skills:
                if query.lower() in s.name.lower() or query.lower() in s.slug.lower():
                    skill = s
                    break
        
        if not skill:
            return {"status": "not_found", "message": f"Skill '{query}' not found in taxonomy."}

        prereqs = []
        if skill.prerequisites:
            for p in skill.prerequisites:
                prereq_skill = await self.skill_repo.get_by_id(p.prerequisite_skill_id)
                if prereq_skill:
                    prereqs.append({
                        "name": prereq_skill.name,
                        "slug": prereq_skill.slug,
                        "level": prereq_skill.level,
                        "category": prereq_skill.category
                    })

        return {
            "id": skill.id,
            "name": skill.name,
            "slug": skill.slug,
            "level": skill.level,
            "category": skill.category,
            "description": skill.description,
            "prerequisites": prereqs,
            "status": "verified"
        }

    async def _tool_get_diagnostic_assessment_explanation(self, args: Dict[str, Any]) -> Dict[str, Any]:
        career_slug = args.get("career_slug", "").strip()
        career = await self.career_repo.get_by_slug(career_slug)
        if not career:
            return {"status": "not_found", "message": f"Career track '{career_slug}' not found."}
        
        assessment = await self.assessment_repo.get_by_career_id(career.id)
        if not assessment:
            return {"status": "not_found", "message": f"No diagnostic assessment found for {career.name}."}

        skill_filter = args.get("skill_name", "").lower()
        questions = []
        for q in assessment.questions:
            if skill_filter and skill_filter not in (q.skill.name.lower() if q.skill else ""):
                continue
            questions.append({
                "question_id": q.id,
                "skill": q.skill.name if q.skill else "General",
                "difficulty": q.difficulty,
                "question_text": q.question_text,
                "options": q.options,
                "explanation": q.explanation
            })

        return {
            "career_name": career.name,
            "assessment_title": assessment.title,
            "total_questions": len(questions),
            "questions": questions,
            "status": "verified"
        }

    async def _tool_get_recommended_resources(self, args: Dict[str, Any]) -> Dict[str, Any]:
        rtype = args.get("resource_type", "all")
        limit = min(int(args.get("limit", 4)), 10)
        
        from app.services.recommendation.recommendation_engine import HybridRecommendationEngine
        engine = HybridRecommendationEngine(self.db)
        recs = await engine.get_recommendations(
            user_id=self.user_id,
            limit=limit,
            resource_type=rtype if rtype != "all" else None,
            persist_log=False
        )

        res_list = []
        for r in recs:
            res_list.append({
                "id": r.resource_id,
                "title": r.title,
                "description": r.description,
                "type": r.resource_type,
                "difficulty": r.difficulty,
                "estimated_minutes": r.estimated_minutes,
                "match_tier": r.match_tier,
                "relevance_score": r.relevance_score,
                "target_skill": r.target_skill_name,
                "reasons": r.explanation_reasons,
                "url": r.url,
                "skills_taught": r.skills_taught
            })

        return {
            "count": len(res_list),
            "recommendations": res_list,
            "status": "verified"
        }

    async def _tool_get_next_best_learning_action(self, args: Dict[str, Any]) -> Dict[str, Any]:
        from app.services.recommendation.recommendation_engine import HybridRecommendationEngine
        engine = HybridRecommendationEngine(self.db)
        action = await engine.get_next_best_action(user_id=self.user_id)
        if not action:
            return {"status": "empty", "message": "No next best action available. Take a diagnostic assessment first."}

        return {
            "title": action.title,
            "headline": action.headline,
            "target_skill": action.target_skill_name,
            "resource_type": action.resource_type,
            "difficulty": action.difficulty,
            "estimated_minutes": action.estimated_minutes,
            "relevance_score": action.relevance_score,
            "primary_reason": action.primary_reason,
            "reasons": action.reasons,
            "url": action.url,
            "status": "verified"
        }

    async def _tool_log_study_progress(self, args: Dict[str, Any]) -> Dict[str, Any]:
        minutes = int(args.get("minutes", 15))
        if minutes <= 0:
            return {"status": "error", "message": "Study minutes must be greater than 0"}
        
        # Get active milestone if available
        path = await self.learning_path_repo.get_active_by_user(self.user_id)
        resource_id = None
        if path and path.items:
            for it in path.items:
                if it.status in ("available", "in_progress") and it.resource_id:
                    resource_id = it.resource_id
                    break

        if not resource_id:
            # Fallback to first resource
            all_res = await self.resource_repo.get_all(limit=1)
            if all_res:
                resource_id = all_res[0].id

        if not resource_id:
            return {"status": "error", "message": "No valid learning resource available to attach progress."}

        progress = Progress(
            user_id=self.user_id,
            resource_id=resource_id,
            time_spent_minutes=minutes,
            status="in_progress"
        )
        await self.progress_repo.create_progress(progress)
        
        # Award XP (10 XP per 15 min)
        xp_earned = max(10, (minutes // 15) * 10)
        await self.user_repo.add_xp(self.user_id, xp_earned)

        return {
            "status": "success",
            "minutes_logged": minutes,
            "xp_earned": xp_earned,
            "message": f"Successfully logged {minutes} minutes of learning. Earned +{xp_earned} XP!"
        }

    async def _tool_semantic_search_learning_resources(self, args: Dict[str, Any]) -> Dict[str, Any]:
        query = args.get("query", "")
        if not query:
            return {"status": "error", "message": "Search query cannot be empty"}
        
        difficulty = args.get("difficulty")
        difficulties = [difficulty] if difficulty else None
        limit = min(int(args.get("limit", 3)), 10)

        from app.services.retrieval_service import RetrievalService
        service = RetrievalService(self.db)
        results = await service.search_resources(
            query=query,
            difficulties=difficulties,
            limit=limit
        )

        return {
            "query": query,
            "count": len(results),
            "results": [
                {
                    "title": r["title"],
                    "type": r["resource_type"],
                    "difficulty": r["difficulty"],
                    "similarity_score": r["similarity_score"],
                    "relevance_percentage": r["relevance_percentage"],
                    "match_tier": r["match_tier"],
                    "skills_taught": r["skills_taught"],
                    "url": r["url"]
                }
                for r in results
            ],
            "status": "verified"
        }

    async def _tool_get_learner_skill_gaps(self, args: Dict[str, Any]) -> Dict[str, Any]:
        from app.services.skill_gap.gap_engine import SkillGapEngine
        engine = SkillGapEngine(self.db)
        summary = await engine.analyze_learner_gaps(user_id=self.user_id)

        return {
            "career_name": summary.career_name,
            "career_readiness_percentage": summary.career_readiness_score,
            "confidence_percentage": summary.confidence_score,
            "is_cold_start": summary.is_cold_start,
            "strongest_skills": summary.strongest_skills,
            "bottlenecks": [
                {
                    "skill_name": b.skill_name,
                    "current_score": b.current_score,
                    "target_score": b.target_score,
                    "downstream_impact": b.downstream_impact_score,
                    "downstream_count": b.downstream_skills_count,
                    "explanation": b.explanation
                }
                for b in summary.bottlenecks
            ],
            "next_best_skill": {
                "skill_name": summary.next_best_skill.skill_name,
                "is_bottleneck": summary.next_best_skill.is_bottleneck,
                "readiness_state": summary.next_best_skill.readiness_state,
                "reason": summary.next_best_skill.reason
            } if summary.next_best_skill else None,
            "top_skill_gaps": [
                {
                    "skill_name": g.skill_name,
                    "current_score": g.current_score,
                    "target_score": g.target_score,
                    "gap_category": g.gap_category,
                    "readiness_state": g.readiness_state,
                    "is_prerequisite_met": g.is_prerequisite_met,
                    "unsatisfied_prerequisites": g.unsatisfied_prerequisites,
                    "explanation": g.explanation
                }
                for g in summary.skill_gaps[:5]
            ],
            "status": "verified"
        }

    async def _tool_get_skill_prerequisites_graph(self, args: Dict[str, Any]) -> Dict[str, Any]:
        identifier = args.get("skill_name_or_slug", "").strip()
        if not identifier:
            return {"status": "error", "message": "skill_name_or_slug is required"}

        from app.services.skill_graph.graph_service import SkillGraphService
        graph = SkillGraphService(self.db)
        await graph.initialize()

        skill = graph.get_skill(identifier)
        if not skill:
            # Fuzzy match
            for s in graph.get_all_skills():
                if identifier.lower() in s.name.lower() or identifier.lower() in s.slug.lower():
                    skill = s
                    break

        if not skill:
            return {"status": "error", "message": f"Skill '{identifier}' not found in taxonomy"}

        direct_prereqs = graph.get_direct_prerequisites(skill.id)
        transitive_prereqs = graph.get_transitive_prerequisites(skill.id)
        downstream = graph.get_direct_downstream(skill.id)
        transitive_down = graph.get_transitive_downstream(skill.id)

        return {
            "skill": {
                "name": skill.name,
                "slug": skill.slug,
                "category": skill.category,
                "domain": skill.domain,
                "difficulty": skill.difficulty,
                "level": skill.level,
                "is_foundation": graph.is_foundation_skill(skill.id),
                "prerequisite_depth": graph.get_prerequisite_depth(skill.id)
            },
            "direct_prerequisites": [
                {"name": p.name, "slug": p.slug, "level": p.level, "category": p.category}
                for p in direct_prereqs
            ],
            "transitive_ancestors": [
                {"name": p.name, "slug": p.slug, "depth": depth, "level": p.level}
                for p, depth in transitive_prereqs
            ],
            "direct_downstream_unlocked": [
                {"name": d.name, "slug": d.slug, "level": d.level, "category": d.category}
                for d in downstream
            ],
            "all_downstream_unlocked": [
                {"name": d.name, "slug": d.slug, "depth": depth, "level": d.level}
                for d, depth in transitive_down
            ],
            "status": "verified"
        }

    async def _tool_get_learner_adaptive_state(self, args: Dict[str, Any]) -> Dict[str, Any]:
        from app.services.adaptive.adaptive_service import AdaptiveLearningService
        service = AdaptiveLearningService(self.db)
        state = await service.get_learner_adaptive_state(self.user_id)
        return {
            "adaptive_state": state,
            "status": "verified"
        }

    async def _tool_get_adaptation_history(self, args: Dict[str, Any]) -> Dict[str, Any]:
        limit = args.get("limit", 10)
        from app.services.adaptive.adaptive_service import AdaptiveLearningService
        service = AdaptiveLearningService(self.db)
        timeline = await service.get_adaptation_timeline(self.user_id, limit=limit)
        return {
            "adaptation_events": timeline,
            "total_events": len(timeline),
            "status": "verified"
        }

    async def _tool_explain_recent_adaptation(self, args: Dict[str, Any]) -> Dict[str, Any]:
        from app.services.adaptive.adaptive_service import AdaptiveLearningService
        service = AdaptiveLearningService(self.db)
        timeline = await service.get_adaptation_timeline(self.user_id, limit=1)
        if not timeline:
            return {
                "has_adaptation": False,
                "message": "No recent roadmap or skill adaptations recorded for this learner.",
                "status": "verified"
            }
        latest = timeline[0]
        return {
            "has_adaptation": True,
            "event_type": latest["event_type"],
            "trigger": latest["trigger"],
            "reason": latest["reason"],
            "previous_state": latest["previous_state"],
            "new_state": latest["new_state"],
            "created_at": latest["created_at"],
            "status": "verified"
        }


