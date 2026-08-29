# PathPilot AI — Frontend Architecture & Developer Guide

## 1. Executive Summary

PathPilot frontend is built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, **Recharts**, and the **Vercel AI SDK**. It interfaces seamlessly with the FastAPI async backend and PostgreSQL 16 relational database authenticated via Supabase JWT sessions.

The frontend is architected around answering the **6 Core Learner Questions**:
1. **Where am I going?** (`/careers`, `/onboarding`)
2. **Where am I now?** (`/assessment/[careerSlug]`, `/skills`)
3. **What am I missing?** (`/skills` gap analysis, prerequisite DAG)
4. **What should I do next?** (`/dashboard` Next Best Action, `/roadmap`)
5. **Why should I do it?** (`/recommendations` with explainable matching criteria)
6. **How am I progressing?** (`/progress` 28-day heatmap, `/analytics` Recharts & Leaderboard)

---

## 2. Route Architecture (`frontend/app/`)

| Route | Purpose & Key Features | Auth Protected |
| :--- | :--- | :---: |
| `/` | Landing page, 6-question framework preview, live career tracks | No |
| `/auth` | Supabase email/password authentication & quick demo profiles | No |
| `/onboarding` | 3-step career track, experience baseline & study pacing wizard | No / Optional |
| `/dashboard` | Main hub: Next Best Action hero, active staircase milestones, skill gaps | Yes |
| `/careers` | Career track catalog with market demand scores & required skills | No / Yes |
| `/assessment/[careerSlug]` | Diagnostic quiz player, progress stepper & results breakdown | Yes |
| `/skills` | Assessed competency levels & interactive Prerequisite DAG Map | Yes |
| `/roadmap` | Phased staircase learning journey with milestone completion actions | Yes |
| `/recommendations` | Filterable courses, projects, and labs with "Why this?" explanations | Yes |
| `/progress` | 28-day study heatmap, time-spent manual logger & completed milestones | Yes |
| `/analytics` | Recharts proficiency vs benchmark (85%) & live guild leaderboard | Yes |
| `/feedback` | Adaptive pacing & milestone difficulty feedback calibration | Yes |
| `/settings` | Profile settings, career track switcher & weekly study hours slider | Yes |
| `/assistant` | AI Learning Navigator UI shell with Vercel AI SDK chat | Yes |
| `/api/chat` | Streaming chat completion endpoint | Yes / Internal |

---

## 3. Reusable Component Architecture (`frontend/components/`)

### Layout & Shell
- `components/layout/AppShell.tsx`: Unified layout containing responsive sidebar, top bar, XP & streak counters, profile menu, and mobile drawer navigation.

### UI Primitives (`components/ui/`)
- `Button.tsx`: Accessible variants (`primary`, `secondary`, `outline`, `danger`, `glow`) with loading states.
- `Card.tsx`: Glassmorphism containers (`glass`, `interactive`, `glow`) with headers, content, and footers.
- `Badge.tsx`: Status and difficulty indicator pills (`indigo`, `cyan`, `emerald`, `amber`, `rose`, `slate`).
- `Modal.tsx`: Accessible dialog modal with backdrop blur and escape listeners.
- `Tabs.tsx`: Accessible tab switcher.
- `Skeleton.tsx`: Polished loading skeletons for async states.

### Domain-Specific Components
- `components/dashboard/NextBestAction.tsx`: High-impact hero widget answering "What should I do next and why?".
- `components/dashboard/ProgressSummary.tsx`: Aggregate metrics (Roadmap %, Completed Milestones, XP, Streak).
- `components/skills/SkillProgress.tsx`: Individual skill proficiency bar with target benchmark marker.
- `components/skills/SkillGapCard.tsx`: Skill gap identification card with priority ranking.
- `components/skills/SkillPrerequisiteMap.tsx`: Progressive 4-tier DAG visualization of skill dependencies.
- `components/roadmap/RoadmapNode.tsx` & `RoadmapPhase.tsx`: Step-by-step sequential staircase milestone nodes.
- `components/recommendations/RecommendationCard.tsx`: Multi-type resource card with provider, duration, and actions.
- `components/recommendations/WhyRecommendation.tsx`: Expandable explanation card breaking down recommendation factors.
- `components/assessment/AssessmentProgress.tsx`: Diagnostic question progress stepper with answer options.
- `components/careers/CareerGoalCard.tsx`: Career explorer card with salary range, market demand, and goal selector.
- `components/assistant/AIChat.tsx`: AI mentor conversational interface with suggested prompt chips.

---

## 4. API Integration Layer (`frontend/lib/api-client.ts`)

All API interactions flow through a centralized, typed singleton `ApiClient`:
- Automatically retrieves and attaches Supabase Auth JWT tokens (`Authorization: Bearer <token>`).
- Normalizes errors and throws user-friendly exception messages.
- Fully typed request and response contracts mapped to domain interfaces in `frontend/types/index.ts`.

---

## 5. Design System & Tokens

- **Theme Palette**: Celestial Violet (`#8b5cf6`), Cyber Indigo (`#6366f1`), Radiant Cyan (`#06b6d4`), Emerald (`#10b981`), Amber (`#f59e0b`), Rose (`#f43f5e`), Dark Slate (`#020617`).
- **Glow & Elevation**: `shadow-glow-indigo`, `shadow-glow-cyan`, `shadow-glow-emerald`, `glass-panel`, `glass-panel-interactive`.
- **Typography**: Inter (`var(--font-inter)`).

---

## 6. Local Development & Build Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run unit & integration tests
npm test

# Build production bundle
npm run build

# Start production server
npm start
```
