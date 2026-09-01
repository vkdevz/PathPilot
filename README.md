# 🧭 PathPilot AI  -  Adaptive AI-Powered Career Learning Platform

PathPilot transforms career development from static course catalogs into a continuously adaptive, AI-driven learning experience. It combines diagnostic skill assessments, intelligent prerequisite graph analysis, hybrid recommendation engines, and a closed-loop adaptive learning system to deliver truly personalized education pathways.

---

## Problem

Online learning platforms offer thousands of courses but provide no intelligent guidance. Learners waste time on content that is too easy, too advanced, or irrelevant to their career goals. There is no diagnostic feedback, no prerequisite awareness, and no adaptation when a learner struggles or excels.

## Solution

PathPilot solves this through an integrated AI pipeline:

1. **Diagnostic Assessment** — Calibrates each learner's actual skill proficiency across career-relevant competencies
2. **Skill Graph Intelligence** — Maps prerequisite dependencies as a directed acyclic graph (DAG) to identify bottleneck skills and optimal learning sequences
3. **Hybrid Recommendation Engine** — Ranks resources using 8 weighted features (skill gap, career alignment, semantic similarity, difficulty fit, pacing, prerequisites, format preference, feedback history)
4. **Adaptive Learning Engine** — Continuously updates proficiency models from evidence (assessments, projects, feedback), detects mastery and struggle states, and dynamically adjusts roadmaps
5. **AI Mentor** — Grounded LLM assistant with tool-calling access to real learner data, providing explainable answers about progress, recommendations, and skill gaps

---

## Key Features

| Feature | Description |
| :--- | :--- |
| **Career Tracks** | 4 industry-aligned career paths (Data Scientist, ML Engineer, Full Stack Developer, AI Engineer) with weighted skill requirements |
| **Diagnostic Quizzes** | Timed multi-choice assessments per career track that calibrate initial skill proficiency |
| **Prerequisite DAG** | In-memory directed acyclic graph with cycle detection, transitive traversal, and downstream impact scoring |
| **Intelligent Skill Gaps** | Multi-factor gap analysis combining raw proficiency gaps with career importance, prerequisite depth, and downstream impact |
| **Career Readiness Score** | Weighted readiness percentage with confidence intervals based on assessment evidence |
| **Hybrid Recommendations** | 8-feature composite scoring with prerequisite constraint filtering and MMR diversity re-ranking |
| **Semantic Retrieval** | pgvector-powered cosine similarity search across resources, skills, and careers |
| **Adaptive Proficiency** | Bayesian-inspired evidence-weighted updates with recency decay (30-day half-life) |
| **Mastery Detection** | 5-state mastery classifier (Not Started → Developing → Practicing → Near Mastery → Mastered) |
| **Struggle Detection** | Consecutive failure detection with automatic reinforcement milestone insertion |
| **Roadmap Versioning** | Non-destructive roadmap snapshots preserving complete adaptation history |
| **AI Mentor** | LLM-powered assistant with tool-calling for real-time learner data inspection |
| **Explainable AI** | Every recommendation and adaptation includes verifiable pedagogical rationale |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Next.js 14 Frontend                │
│     (TypeScript, Tailwind CSS, App Router)      │
└──────────────────────┬──────────────────────────┘
                       │ REST API
                       ▼
┌─────────────────────────────────────────────────┐
│             FastAPI Backend (Python)             │
│  ┌────────────┐ ┌────────────┐ ┌─────────────┐ │
│  │ Assessment  │ │Skill Graph │ │  Adaptive   │ │
│  │  Service    │ │  Service   │ │   Engine    │ │
│  └────────────┘ └────────────┘ └─────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌─────────────┐ │
│  │   Hybrid   │ │  Semantic  │ │     AI      │ │
│  │ Recommender│ │ Retrieval  │ │  Assistant  │ │
│  └────────────┘ └────────────┘ └─────────────┘ │
└──────────────────────┬──────────────────────────┘
                       │ SQLAlchemy 2.0 (Async)
                       ▼
┌─────────────────────────────────────────────────┐
│        PostgreSQL 16 + pgvector (Supabase)      │
│                                                  │
│  Skills │ Careers │ Resources │ Assessments      │
│  Users  │ Paths   │ Evidence  │ Embeddings       │
│  Adaptations │ Roadmap Versions │ Feedback       │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              External AI Services                │
│      LLM Provider (OpenAI / Gemini)              │
│      Embedding Provider (or Deterministic)       │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 (async) |
| **Database** | PostgreSQL 16 with pgvector extension (Supabase) |
| **Auth** | Supabase Auth (JWT verification in FastAPI) |
| **AI/ML** | LLM API (OpenAI/Gemini), Deterministic Semantic Embeddings, NumPy |
| **Migrations** | Alembic |

---

## AI/ML Components

### Recommendation Engine
- **8-Feature Hybrid Scoring**: skill_gap × career_alignment × roadmap_affinity × semantic_similarity × difficulty_fit × format_preference × pacing_fit × feedback_prior
- **Prerequisite Constraint Filter**: Hard filter preventing prerequisite-violating recommendations (0% violation rate)
- **MMR Diversity Re-Ranking**: Maximal Marginal Relevance ensures topic diversity in final recommendation lists

### Adaptive Learning Engine
- **Bayesian-Inspired Updates**: α = min(Wₑ · Cₑ · 2^(-Δt/30), 0.65) with evidence reliability weighting
- **Mastery State Machine**: 5-tier classification with confidence thresholds
- **Struggle Detection**: Consecutive failure analysis with automatic reinforcement insertion
- **SHA-256 Deduplication**: Prevents duplicate evidence from corrupting proficiency models

### Semantic Retrieval
- **pgvector Cosine Similarity**: 1536-dimensional embeddings indexed with IVFFlat
- **Unified Search**: Cross-entity semantic search across resources, skills, and careers

### AI Mentor
- **Tool-Calling Architecture**: LLM accesses learner data through controlled tool functions (roadmap, skills, recommendations, adaptive state)
- **Grounded Responses**: All learner-specific facts sourced from database, not hallucinated
- **Safety Rails**: System prompt injection protection, no direct database/filesystem access

---

## Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 16 with pgvector extension (or Supabase account)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database URL, Supabase keys, and LLM API key

# Start the server (auto-creates tables and seeds data)
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Start development server
npm run dev
```

### Database Setup

The application automatically:
1. Creates all tables on startup via SQLAlchemy `create_all`
2. Runs the idempotent seeder (4 careers, 11 skills, 20 resources, prerequisite relationships, assessment questions)
3. Generates semantic embeddings for all entities

For manual migration management:
```bash
cd backend
alembic upgrade head
```

---

## Testing

### Backend Tests (84 tests)
```bash
cd backend
./venv/bin/pytest tests -v
```

### Frontend Tests (19 tests)
```bash
cd frontend
npm test
```

### Production Build
```bash
cd frontend
npm run build
```

---

## Demo Flow

1. **Sign up / Login** → Supabase Auth creates authenticated session
2. **Onboarding** → Select career track and learning preferences
3. **Diagnostic Assessment** → Timed quiz calibrates skill proficiency per career
4. **Dashboard** → View skill gaps, adaptive banner, career readiness, next best action
5. **Skills Page** → Prerequisite DAG visualization, intelligent gap analysis, bottleneck detection
6. **Roadmap** → Sequential milestone staircase with versioned adaptive progression
7. **Recommendations** → Hybrid-ranked resources with explainable feature breakdowns
8. **AI Mentor** → Ask "What should I learn next?" or "Why did my roadmap change?"
9. **Complete Activity** → Evidence ingested, proficiency recalibrated, roadmap adapts
10. **Repeat** → Continuous closed-loop learning

---

## Limitations

- Embedding provider falls back to deterministic hashing when no API key is configured (functional but lower semantic quality)
- Assessment question bank is seeded with a curated set per career track (not dynamically generated)
- Deployment requires manual Supabase project setup and pgvector extension enablement
- LLM responses depend on external API availability

---

## Future Work

- Real-time collaborative learning features
- Spaced repetition integration for long-term retention
- Portfolio project auto-grading
- Mobile-native experience
- Multi-language support
