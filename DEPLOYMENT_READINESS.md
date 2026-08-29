# 🚢 PathPilot AI — Production Deployment Readiness Guide

---

## Target Deployment Architecture

```
GitHub Repository
   ├── /backend ────────► Render (Python 3.12 Web Service)
   │                         ├── FastAPI (Uvicorn Async ASGI)
   │                         ├── In-Memory Sliding Window Rate Limiter
   │                         └── Deterministic Embedding Provider
   │
   ├── /frontend ───────► Vercel (Next.js 14 App Router)
   │                         ├── React 18, Tailwind CSS, Lucide Icons
   │                         ├── Route Guard Middleware
   │                         └── Server Actions / Edge API Proxy
   │
   └── /database ───────► Supabase (Managed PostgreSQL 16 + pgvector)
                             ├── pgvector Extension (1536 dim)
                             ├── User & Profile Tables
                             ├── Assessment & Diagnostic Tables
                             ├── Skills, DAG Edges & Career Maps
                             └── Evidence, Adaptations & Roadmap Versions
```

---

## 1. Backend Deployment (Render)

### Step 1: Create Render Web Service
1. Connect your GitHub repository on [dashboard.render.com](https://dashboard.render.com).
2. Choose **Web Service**.
3. Set **Root Directory** to `backend`.
4. Set **Runtime** to `Python 3`.
5. Set **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```
6. Set **Start Command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Step 2: Environment Variables on Render
Add the following in the Render Environment tab:

```ini
PYTHON_VERSION=3.12.6
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SUPABASE-SERVICE-KEY]
SUPABASE_JWT_SECRET=[YOUR-SUPABASE-JWT-SECRET]
OPENAI_API_KEY=[YOUR-OPENAI-API-KEY]
ENVIRONMENT=production
DEV_MODE=false
```

### Step 3: Health Check
Render Health Check Path: `/api/v1/health`

---

## 2. Frontend Deployment (Vercel)

### Step 1: Import Project on Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and select the repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.

### Step 2: Environment Variables on Vercel
Add the following in Vercel Project Settings → Environment Variables:

```ini
NEXT_PUBLIC_API_BASE_URL=https://[YOUR-RENDER-SERVICE-NAME].onrender.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
```

### Step 3: Deploy & Verify
- Click **Deploy**.
- Vercel will compile all 17 routes and deploy globally on Edge CDN.

---

## 3. Database Initialization (Supabase / PostgreSQL)

1. Ensure the `vector` extension is enabled in Supabase SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
2. The FastAPI backend automatically runs table creation and database seeding on first startup via `lifespan` handler:
   - 44 Skills seeded with taxonomy domains and difficulty levels.
   - 4 Career tracks with required skill relationships.
   - 32 Learning resources with vector embeddings.
   - 40 Diagnostic questions mapped to competency topics.

---

## 4. Production Smoke Test Checklist

- [x] `GET /api/v1/health` returns `200 OK` with database online.
- [x] Registration and Login with Supabase / Dev mode returns valid session token.
- [x] Taking diagnostic quiz successfully scores competencies and creates active Roadmap.
- [x] Hybrid Recommendation Engine returns top 6 resources with zero prerequisite violations.
- [x] AI Learning Navigator answers questions with live learner context.
- [x] Completing milestone updates state and logs progression in progress heatmap.
- [x] Submitting project evidence triggers Bayesian proficiency update and state snapshot.
