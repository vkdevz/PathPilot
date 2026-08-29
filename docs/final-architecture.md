# PathPilot 2.0 — Final Architecture

## System Overview

PathPilot is an adaptive AI-powered career learning platform built as a three-tier web application with a Next.js frontend, FastAPI backend, and PostgreSQL database with pgvector semantic search.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                 Next.js 14 (App Router)                    │  │
│  │                                                            │  │
│  │  Pages:                         Components:                │  │
│  │  /auth          /dashboard      AppShell, Sidebar          │  │
│  │  /onboarding    /careers        SkillGapCard, RadarChart   │  │
│  │  /assessment    /skills         AdaptationBanner/Timeline  │  │
│  │  /roadmap       /recommendations NextBestAction            │  │
│  │  /progress      /analytics      RoadmapPhase              │  │
│  │  /assistant     /feedback       ProgressSummary            │  │
│  │  /leaderboard   /settings       SkillGraphViewer           │  │
│  │                                                            │  │
│  │  Auth: Supabase JS Client (JWT sessions)                   │  │
│  │  API:  api-client.ts → REST calls to FastAPI               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                    REST API (JSON)                                │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │               FastAPI Application (Python)                 │  │
│  │                                                            │  │
│  │  ┌─── API Routers (/api/v1/) ──────────────────────────┐  │  │
│  │  │ auth    careers    assessments   skills    roadmaps  │  │  │
│  │  │ recommendations   retrieval     chat      adaptive  │  │  │
│  │  │ progress  feedback  analytics   profile             │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌─── Core Services ──────────────────────────────────┐   │  │
│  │  │                                                    │   │  │
│  │  │  AssessmentService     SkillGraphService            │   │  │
│  │  │  SkillGapEngine        HybridRecommendationEngine   │   │  │
│  │  │  SemanticRetrievalSvc  AdaptiveLearningService      │   │  │
│  │  │  EmbeddingPipeline     AIAssistantService           │   │  │
│  │  │  ProficiencyEngine     MasteryDetector              │   │  │
│  │  │  RoadmapAdapter        BenchmarkEvaluator           │   │  │
│  │  │                                                    │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  │  Auth: Supabase JWT verification (security.py)             │  │
│  │  ORM:  SQLAlchemy 2.0 Async + Alembic migrations           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │            PostgreSQL 16 + pgvector (Supabase)             │  │
│  │                                                            │  │
│  │  Relational Tables:                                        │  │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐ ┌───────────────┐    │  │
│  │  │ users  │ │careers │ │  skills   │ │   resources   │    │  │
│  │  │profiles│ │car_skl │ │ prereqs  │ │ resource_skls │    │  │
│  │  └────────┘ └────────┘ └──────────┘ └───────────────┘    │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐   │  │
│  │  │ assessments │ │learning_paths│ │ learner_skills   │   │  │
│  │  │  questions  │ │   items      │ │ learner_evidence │   │  │
│  │  └─────────────┘ └──────────────┘ └──────────────────┘   │  │
│  │  ┌───────────────────┐ ┌──────────────────────────────┐   │  │
│  │  │ adaptation_events │ │  roadmap_versions            │   │  │
│  │  │ state_history     │ │  entity_embeddings (vector)  │   │  │
│  │  └───────────────────┘ └──────────────────────────────┘   │  │
│  │                                                            │  │
│  │  Vector Index: IVFFlat on 1536-dim embedding column        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL AI SERVICES                          │
│                                                                  │
│  ┌────────────────────┐  ┌─────────────────────────────────┐    │
│  │   LLM Provider     │  │   Embedding Provider             │    │
│  │   (OpenAI/Gemini)  │  │   (text-embedding-3-small or     │    │
│  │                    │  │    Deterministic fallback)        │    │
│  └────────────────────┘  └─────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow: Adaptive Learning Loop

```
User completes assessment
        │
        ▼
┌─ Evidence Ingestion ──────────────────────────────┐
│  SHA-256 deduplication → reliability weighting     │
└───────────────────────┬───────────────────────────┘
                        ▼
┌─ Proficiency Engine ──────────────────────────────┐
│  α = min(Wₑ·Cₑ·2^(-Δt/30), 0.65)                │
│  P(t) = (1-α)·P(t-1) + α·Score                   │
└───────────────────────┬───────────────────────────┘
                        ▼
┌─ Mastery/Struggle Detection ──────────────────────┐
│  5-state mastery classifier                        │
│  Consecutive failure struggle detector             │
└───────────────────────┬───────────────────────────┘
                        ▼
┌─ Skill Intelligence (DAG) ────────────────────────┐
│  Recalculate gaps, bottlenecks, priorities         │
└───────────────────────┬───────────────────────────┘
                        ▼
┌─ Roadmap Adapter ─────────────────────────────────┐
│  Insert reinforcement (struggle)                   │
│  Unlock downstream (mastery)                       │
│  Create immutable version snapshot                 │
└───────────────────────┬───────────────────────────┘
                        ▼
┌─ Adaptation Event ────────────────────────────────┐
│  Record trigger, state diff, pedagogical reason    │
│  Surface in UI via AdaptationBanner + Timeline     │
└───────────────────────────────────────────────────┘
```

## Authentication Flow

```
Frontend (Supabase JS)          Backend (FastAPI)
        │                              │
        │  signUp / signIn             │
        │  ────────────────►           │
        │  ◄── JWT access token ───    │
        │                              │
        │  API request + Bearer JWT    │
        │  ────────────────────────►   │
        │       │                      │
        │       │  verify_supabase_token()
        │       │  Extract user.sub (UUID)
        │       │  Query User model by ID
        │       │                      │
        │  ◄── Authenticated response  │
```

## Security Model

- **Authentication**: Supabase Auth JWT (HS256) verified on every API request
- **Authorization**: User ID extracted from JWT `sub` claim — never from client request body
- **Data Isolation**: All queries scoped to authenticated user's ID
- **AI Safety**: LLM accesses data only through controlled tool functions; no direct SQL/filesystem access
- **Input Validation**: Pydantic v2 models on all API endpoints
- **Error Handling**: Global exception handler prevents stack trace leakage

## Recommendation Engine Architecture

```
Learner State Extraction
        │
        ▼
Candidate Generation (Resource Pool)
        │
        ▼
Prerequisite Constraint Filter (hard gate)
        │
        ▼
8-Feature Scoring Matrix
  ├── skill_gap_score      (0.0-1.0)
  ├── career_alignment     (0.0-1.0)
  ├── roadmap_affinity     (0.0-1.0)
  ├── semantic_similarity  (0.0-1.0)
  ├── difficulty_fit       (0.0-1.0)
  ├── format_preference    (0.0-1.0)
  ├── pacing_fit           (0.0-1.0)
  └── feedback_prior       (0.0-1.0)
        │
        ▼
Weighted Composite Score
        │
        ▼
MMR Diversity Re-Ranking (λ=0.7)
        │
        ▼
Explainable Recommendation List
```
