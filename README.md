# 🧭 PathPilot AI — Adaptive AI-Powered Career Learning Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Vector%20DB-pgvector%20%2F%20Supabase-4169E1?logo=postgresql)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-103%20Passing-brightgreen?logo=pytest)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()

> **PathPilot** bridges the gap between static curriculum catalogs and real-world competency. By combining in-memory directed acyclic graph (DAG) analysis, multi-factor hybrid recommendation scoring, and a Bayesian-inspired adaptive engine, PathPilot dynamically updates individualized learning pathways in real time.

🔗 **Live Application:** [path-pilot-lemon.vercel.app](https://path-pilot-lemon.vercel.app)  
📑 **Repository:** [github.com/vkdevz/PathPilot](https://github.com/vkdevz/PathPilot)

---

## 📌 Problem & Impact

Online learning portals drown students in thousands of uncurated modules without actionable diagnostic signals. Learners frequently hit two dead ends:
- Spending time on low-yield material they have already mastered.
- Attempting high-difficulty topics while missing critical prerequisite skills.

**PathPilot solves this through an integrated, closed-loop AI pipeline:**
1. **Calibrate:** Diagnostic assessments measure true competency across 4 core engineering domains.
2. **Graph Analysis:** In-memory DAG identifies structural learning bottlenecks and prerequisite dependencies.
3. **Rank:** An 8-feature composite scoring engine with MMR (Maximal Marginal Relevance) surfaces optimal modules with zero prerequisite violations.
4. **Adapt:** Real-time evidence ingestion recalibrates readiness scores, dynamically restructuring the learner's milestone staircase.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 14 Web Frontend                     │
│    (TypeScript, Tailwind CSS, Lucide React, Recharts)       │
└──────────────────────────────┬──────────────────────────────┘
│ JSON / REST API (JWT Authenticated)
▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend Service                   │
│  ┌───────────────────────┐ ┌─────────────────────────────┐  │
│  │ Assessment Engine     │ │ In-Memory Skill DAG Engine  │  │
│  └───────────────────────┘ └─────────────────────────────┘  │
│  ┌───────────────────────┐ ┌─────────────────────────────┐  │
│  │ 8-Feature Recommender │ │ Bayesian Adaptive Engine    │  │
│  └───────────────────────┘ └─────────────────────────────┘  │
│  ┌───────────────────────┐ ┌─────────────────────────────┐  │
│  │ Semantic Search Core  │ │ Tool-Calling AI Mentor (LLM)│  │
│  └───────────────────────┘ └─────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
│ Async SQLAlchemy 2.0 Pool
▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL 16 + pgvector (Supabase)            │
│  • IVFFlat Vector Indexing (1536-dim embeddings)             │
│  • Evidence Deduplication & Idempotent Migration Schema      │
│  • Append-Only Roadmap Versioning Snapshots                 │
└─────────────────────────────────────────────────────────────┘
```
---

## ⚙️ Core Technical Highlights

| Component | Technical Implementation & Rationale |
| :--- | :--- |
| **Prerequisite DAG** | Built as an in-memory directed acyclic graph with cycle detection, transitive reduction, and downstream impact scoring. Prevents prerequisite violation errors completely (0% violation rate). |
| **Hybrid Ranking** | Multi-objective scoring combining 8 weighted features (`skill_gap`, `career_alignment`, `difficulty_fit`, `pacing`, `semantic_similarity`, etc.) followed by **MMR re-ranking** to ensure curriculum diversity. |
| **Adaptive Proficiency** | Bayesian-inspired state updates with evidence weight decay (30-day half-life). Includes SHA-256 evidence hashing to prevent duplicate submission distortions. |
| **Vector Search** | pgvector cosine distance queries over 1536-dimension embeddings, enabling unified cross-entity discovery across skills, careers, and learning resources. |
| **Deterministic AI Mentor** | LLM assistant constrained via controlled function calling. Queries live database state directly rather than hallucinating progression metrics. |

---

## 🛠️ Tech Stack

**Client**  
![Next.js 14](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B573?style=for-the-badge)

**Server**  
![Python 3.12](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Pydantic v2](https://img.shields.io/badge/Pydantic_v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white)
![SQLAlchemy 2.0](https://img.shields.io/badge/SQLAlchemy_2.0-D71F00?style=for-the-badge)
![Uvicorn](https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge)

**Persistence & Vector Store**  
![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-336791?style=for-the-badge)
![Supabase Auth](https://img.shields.io/badge/Supabase_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**AI / LLM Layer**  
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Google Gemini API](https://img.shields.io/badge/Google_Gemini_API-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 16 with `pgvector` enabled (or Supabase instance)

### 2. Backend Setup

```bash
cd backend

# Setup environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure variables
cp .env.example .env

# Run local development server (includes auto-migration & seeder)
uvicorn app.main:app --reload --port 8000
````

### 3. Frontend Setup
````bash
cd frontend

# Install packages
npm install

# Configure local variables
cp .env.example .env.local

# Start Next.js server
npm run dev
````
### 🧪Test Suite & Validation
```bash
# Run backend test suite (84 tests)
cd backend && pytest tests -v

# Run frontend unit tests (19 tests)
cd frontend && npm test
````
### License
Distributed under the MIT License. See LICENSE for more information
