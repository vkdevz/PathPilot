# PathPilot — Hackathon Submission

## Project Name
**PathPilot AI** — Adaptive Career Learning Platform

## One-Line Pitch
An AI-powered platform that diagnoses your skills, maps prerequisite dependencies, recommends personalized resources, and continuously adapts your learning roadmap based on real evidence of mastery and struggle.

---

## Problem

**Online learning is broken.** Platforms like Coursera, Udemy, and LinkedIn Learning offer 200,000+ courses but zero intelligent guidance. Learners face:

- **No diagnostic calibration** — Everyone starts at the same place regardless of existing knowledge
- **No prerequisite awareness** — Learners attempt advanced topics without mastering foundations
- **No adaptation** — The same curriculum is served whether a learner struggles for weeks or masters content in hours
- **No explainability** — Recommendations are opaque; learners don't know *why* a course was suggested

**Result**: 90%+ dropout rates in online courses. Learners waste time, lose motivation, and fail to reach career readiness.

---

## Solution

PathPilot creates a **closed-loop adaptive learning system**:

1. **Diagnose** → Calibrate actual skill proficiency through career-specific assessments
2. **Map** → Build a prerequisite dependency graph identifying bottleneck skills
3. **Recommend** → Rank learning resources using 8 weighted features with explainable scoring
4. **Adapt** → Continuously update proficiency models from evidence, detect mastery/struggle, and dynamically adjust roadmaps
5. **Explain** → Every recommendation and adaptation includes verifiable pedagogical rationale

---

## Target Users
- Career transitioners entering tech (data science, ML engineering, full-stack development)
- Self-directed learners who need structured guidance
- Bootcamp students seeking personalized supplementary resources
- University students preparing for industry roles

---

## Key Innovation

### Closed-Loop Adaptive Learning
Unlike static recommendation systems, PathPilot implements a **continuous evidence-based learning loop**:

```
Assessment → Evidence → Proficiency Update → Gap Recalculation →
Roadmap Adaptation → New Recommendations → Next Assessment → ↺
```

### Bayesian-Inspired Proficiency Model
Evidence is weighted by source reliability (proctored exam > quiz > self-report), scaled by confidence, and decayed by recency (30-day half-life):

```
α = min(Wₑ · Cₑ · 2^(-Δt/30), 0.65)
P(t) = (1 - α) · P(t-1) + α · Score
```

### Prerequisite-Aware Recommendations
The hybrid engine hard-filters any resource whose prerequisites aren't met — achieving **0% prerequisite violation rate** in offline evaluation.

---

## Architecture

```
Next.js 14 → FastAPI → PostgreSQL + pgvector → LLM/Embedding APIs
```

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| Database | PostgreSQL 16 + pgvector (Supabase) |
| Auth | Supabase Auth (JWT) |
| AI | LLM API (OpenAI/Gemini), Semantic Embeddings |

---

## AI Components

| Component | Method | Key Metric |
| :--- | :--- | :--- |
| Diagnostic Assessment | Timed MCQ with per-skill scoring | Calibrated proficiency per skill |
| Skill Graph | In-memory DAG traversal, bottleneck detection | Prerequisite depth, downstream impact |
| Hybrid Recommender | 8-feature weighted scoring + MMR diversity | Precision@5, 0% prereq violations |
| Semantic Search | pgvector cosine similarity (1536-dim) | Sub-50ms retrieval latency |
| Adaptive Engine | Bayesian proficiency updates, mastery/struggle detection | 100% benchmark accuracy (15 scenarios) |
| AI Mentor | LLM with tool-calling for grounded responses | Hallucination-resistant via data tools |

---

## Personalization & Adaptivity

PathPilot personalizes across **7 dimensions**:

1. **Career goal** — Skill requirements weighted by career importance
2. **Current proficiency** — Diagnostic assessment calibration
3. **Prerequisite readiness** — DAG-based prerequisite completion checking
4. **Learning pace** — Empirical velocity estimation (fast/normal/slow)
5. **Format preference** — Interactive, video, reading, project
6. **Difficulty fit** — Cognitive readiness scoring per resource
7. **Feedback history** — NLP-parsed qualitative feedback adjusting difficulty priors

---

## Example User Journey

**Alex** wants to become a Data Scientist. She knows Python and SQL but has gaps in Statistics and Machine Learning.

1. Takes the Data Scientist diagnostic quiz → Statistics: 35%, ML: 28%, Python: 88%, SQL: 82%
2. Skill graph identifies Statistics as a **bottleneck** blocking 4 downstream skills
3. Roadmap places Statistics as Milestone #1, ML as Milestone #2
4. Recommendations surface beginner statistics practice labs (not advanced ML papers)
5. Alex completes a Statistics assessment scoring 87% → **MASTERED** state detected
6. Roadmap automatically advances: Statistics marked complete, ML unlocked
7. Recommendations shift to ML resources at appropriate difficulty
8. AI mentor explains: "Your roadmap updated because you demonstrated mastery in Statistics (87%). Machine Learning is now unlocked."

---

## Impact

- **Reduced time-to-competency** through prerequisite-aware sequencing
- **Lower dropout rates** through struggle detection and adaptive reinforcement
- **Measurable skill growth** through evidence-based proficiency tracking
- **Career-aligned learning** through weighted skill importance scoring
- **Transparent AI** through explainable recommendations and adaptation rationale

---

## Security

- Supabase Auth JWT verification on every API endpoint
- User data isolation (queries scoped to authenticated user ID from JWT)
- LLM accesses data only through controlled tool functions
- SHA-256 evidence deduplication prevents replay attacks
- No secrets in repository; all credentials via environment variables

---

## Limitations

- Assessment question bank is curated (not dynamically generated)
- Embedding quality depends on API provider availability (deterministic fallback exists)
- Single-learner focus (no collaborative/social learning features yet)
- Career tracks limited to 4 initial paths (extensible via database seeding)

---

## Future Scope

- Spaced repetition for long-term knowledge retention
- Portfolio project auto-grading via code analysis
- Peer mentoring and collaborative study groups
- Mobile-native application
- Enterprise/institutional deployment with cohort analytics
