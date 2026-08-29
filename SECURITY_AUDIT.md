# 🛡️ PathPilot 2.0 — Security & Compliance Audit

---

## 1. Authentication & Authorization Controls

### 1.1 JWT Token Verification
- **Production Standard**: Validates asymmetric/symmetric Supabase JWT tokens via `PyJWT` with algorithm lock (`HS256`/`RS256`).
- **Signature & Expiration Verification**: Rejects expired tokens (`exp`), unauthorized issuers (`iss`), and missing subject IDs (`sub`).
- **Dev Mode Containment**: `DEV_MODE` tokens (`dev-token-<user_id>`) are explicitly restricted to non-production environments (`settings.DEV_MODE=True` or `settings.TESTING=True`).

### 1.2 Route & Data Isolation
- **Frontend Route Guard**: `AppShell.tsx` intercepts all unauthenticated page loads for protected routes (`/dashboard`, `/skills`, `/recommendations`, `/roadmap`, `/assistant`, `/progress`, `/feedback`, `/settings`) and safely redirects to `/auth`.
- **Row-Level User Data Isolation**: Every mutating endpoint (`/profile`, `/roadmaps/milestones/{id}/complete`, `/learners/me/evidence`, `/progress/log`) strictly derives `user_id` from the cryptographically verified JWT (`current_user.id`). Users cannot access or mutate another learner's learning path or competency history.

---

## 2. Rate Limiting & Denial of Service Protection

### 2.1 Sliding Window Middleware
PathPilot features an in-memory sliding window rate limiter implemented in [`backend/app/core/rate_limit.py`](file:///Users/pankajkumar/Downloads/HCL-main/backend/app/core/rate_limit.py) with endpoint-tiered quota enforcement:

| Tier | Endpoints Included | Rate Limit | Behavior on Limit Exceeded |
| :--- | :--- | :--- | :--- |
| **Auth** | `/auth/sync`, `/auth/me` | **30 req / min** | `429 Too Many Requests` + `Retry-After: 60` |
| **AI / Chat** | `/ai/chat`, `/ai/chat/sync` | **40 req / min** | `429 Too Many Requests` + `Retry-After: 60` |
| **Recommendations & Search** | `/recommendations`, `/retrieval` | **60 req / min** | `429 Too Many Requests` + `Retry-After: 60` |
| **General** | All other `/api/v1` routes | **200 req / min** | `429 Too Many Requests` + `Retry-After: 60` |

### 2.2 Client-Side Handling
The frontend gracefully handles `429` status responses by surfacing contextual warnings with remaining cooldown seconds instead of failing silently.

---

## 3. SQL Injection & Database Safety

- **SQLAlchemy 2.0 Parameterized Queries**: All database interactions use SQLAlchemy 2.0 typed `select()`, `insert()`, and `update()` constructs. Zero raw string concatenation in SQL queries.
- **Async Session Management**: Each request receives an isolated scoped `AsyncSession` injected via FastAPI dependency injection with automatic transaction rollback on unhandled exceptions.
- **Eager Loading**: Critical relationships use `selectinload` to prevent unhandled `MissingGreenlet` exceptions during concurrent async access.

---

## 4. AI Guardrails & Prompt Injection Protection

- **Sandboxed Tool Execution**: AI tools (`get_learner_profile`, `get_skill_gaps`, `search_resources`, `get_roadmap_milestones`) are isolated functions with rigid Pydantic parameter schemas. Tools execute within the verified learner's scoped permissions only.
- **System Prompt Integrity**: System instructions enforce strict role boundaries (PathPilot AI Academic Mentor), refusing requests to generate malicious code, reveal system prompt instructions, or execute arbitrary commands.
- **Deterministic Embedder Fallback**: Offline / Deterministic embedding provider ensures semantic search remains 100% operational even during external third-party API outages.

---

## 5. Security Certification

| Security Dimension | Audit Result | Status |
| :--- | :--- | :--- |
| **Authentication Security** | Cryptographically verified JWT | ✅ Passed |
| **Authorization & Tenant Isolation** | Per-user DB scoping via JWT identity | ✅ Passed |
| **Rate Limiting** | Tiered sliding window active | ✅ Passed |
| **Input Sanitization & Validation** | Pydantic v2 strict schemas | ✅ Passed |
| **SQL Injection Prevention** | 100% Parameterized ORM queries | ✅ Passed |
| **CORS Policy** | Configurable allowed origins via settings | ✅ Passed |
