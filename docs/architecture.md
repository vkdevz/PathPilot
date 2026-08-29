# PathPilot AI — Architecture Specification
**Document Version:** 1.0.0  

## Executive Summary
PathPilot AI is an enterprise-grade personalized learning and career navigation platform. The architecture enforces strict separation of concerns, transactional consistency, relational normalization, vector search capabilities, and JWT-authenticated user isolation.

```
+-----------------------------------------------------------------------+
|                         Next.js 14 Frontend                           |
|      (App Router, TypeScript, Tailwind CSS, shadcn/ui, Lucide)        |
+-----------------------------------+-----------------------------------+
                                    | HTTPS / JSON (Bearer JWT)
                                    v
+-----------------------------------------------------------------------+
|                         FastAPI Backend                               |
|   - Supabase JWT Verification Middleware (PyJWT & Cryptography)       |
|   - Modular Layers: Core -> Models -> Repositories -> Services -> API |
|   - Idempotent Database Seeder & Lifespan Event Handling              |
+-----------------------------------+-----------------------------------+
                                    | SQLAlchemy 2.0 Async (asyncpg)
                                    v
+-----------------------------------------------------------------------+
|                PostgreSQL 16 Database (Supabase)                      |
|   - 18 Normalized Relational Tables (Users, Careers, Skills, etc.)    |
|   - pgvector Extension (1536-dim vector embeddings)                   |
|   - Alembic Managed Migrations & Foreign Key Cascading                |
+-----------------------------------------------------------------------+
```

---

## 2. Locked Technology Stack

| Layer | Selected Locked Technology | Purpose & Constraints |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 App Router, TypeScript, Tailwind CSS | High performance, Server/Client components, centralized API client. |
| **Backend** | Python 3.12, FastAPI, Pydantic v2 | High-throughput async REST endpoints, automated OpenAPI docs. |
| **Database** | PostgreSQL 16 on Supabase with `pgvector` | Acid compliance, normalized relations, semantic vector retrieval. |
| **ORM & Migrations** | SQLAlchemy 2.0 (Async), Alembic | Clean repository abstraction, schema versioning. |
| **Authentication** | Supabase Auth (JWT) | Asymmetric token verification, strict user data isolation. |
| **Deployment** | Vercel (Frontend), Render/Railway (Backend), Supabase (DB/Auth) | Production-ready zero-config serverless/container deployment. |

---

## 3. Backend Module Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── analytics.py       # Live leaderboard & analytics endpoints
│   │       ├── assessments.py     # Diagnostic quiz player & evaluation
│   │       ├── auth.py            # User profile sync & me endpoints
│   │       ├── careers.py         # Career tracks & skill trees
│   │       ├── feedback.py        # Milestone pacing adaptation feedback
│   │       ├── profile.py         # Learner profile & target career updates
│   │       ├── progress.py        # Study time logging & 28-day heatmap
│   │       ├── roadmaps.py        # Personalized staircase roadmap progression
│   │       ├── router.py          # Unified v1 router aggregator
│   │       └── skills.py          # Skill taxonomy & learner competency map
│   ├── core/
│   │   ├── config.py              # Pydantic v2 BaseSettings
│   │   ├── database.py            # Async engine, sessionmaker, Base
│   │   ├── logging.py             # Structured application logger
│   │   └── security.py            # Supabase JWT decoding & verification
│   ├── dependencies/
│   │   ├── auth.py                # get_current_user & verify_user_ownership
│   │   └── database.py            # get_db async session dependency
│   ├── models/                    # 18 SQLAlchemy 2.0 async models
│   ├── repositories/              # Clean DB data access layer
│   ├── schemas/                   # Pydantic request/response DTOs
│   ├── seed/                      # Curated seed datasets & idempotent seeder
│   ├── services/                  # Core domain & business logic layer
│   └── main.py                    # FastAPI application & lifespan
├── alembic/                       # Alembic async migration suite
└── tests/                         # Pytest test suite (100% passing)
```

---

## 4. Security & Data Isolation Guarantees

1. **Zero Client Trust**: All user identifiers (`user_id`) are decoded directly from verified Supabase JWT tokens via `get_current_user`.
2. **User Isolation**: All private database queries filter by `user_id == current_user.id`.
3. **Foreign Key Integrity**: Relational cascading ensures that deleting a user or career cleanly purges associated records without orphans.
