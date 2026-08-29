# PathPilot — Demo Script

## Pre-Demo Setup (Before Presentation)

```bash
# Terminal 1: Start backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend && npm run dev
```

Verify:
- Backend health: `http://localhost:8000/health` → `{"status": "online"}`
- Frontend: `http://localhost:3000` → Landing page loads

---

## Demo Flow (5-7 minutes)

### Act 1: The Problem (30 seconds)

**Narration**: "Online learning platforms have millions of courses but zero intelligent guidance. Learners don't know what to learn next, waste time on wrong-level content, and 90% drop out. PathPilot solves this."

→ Show the **Landing Page** — highlight the value proposition

---

### Act 2: Onboarding & Diagnosis (1 minute)

1. **Sign Up** → Create account via Supabase Auth
2. **Select Career** → Choose "Data Scientist"
3. **Configure Learning Profile** → Set experience level, pace, format preference

**Narration**: "PathPilot starts by understanding your career goal and learning style."

4. **Take Diagnostic Assessment** → Start the timed quiz

**Narration**: "Instead of assuming everyone starts at zero, PathPilot runs a diagnostic assessment to calibrate your actual skill levels."

5. **View Results** → Show the skill proficiency radar chart

**Narration**: "Alex scores 88% in Python but only 35% in Statistics. PathPilot now knows exactly where the gaps are."

---

### Act 3: Intelligent Skill Analysis (1.5 minutes)

6. Navigate to **Skills Page**

**Narration**: "PathPilot doesn't just show gaps — it understands skill dependencies."

7. **Show Prerequisite Graph** → Point out the DAG visualization

**Narration**: "Statistics is a bottleneck skill — 4 other skills depend on it. PathPilot identifies this automatically using graph traversal."

8. **Show Intelligent Skill Gaps** → Highlight the gap analysis cards

**Narration**: "Each gap is scored by combining raw proficiency deficit, career importance weight, prerequisite depth, and downstream impact. This isn't a simple 'low score' list — it's a multi-factor prioritization."

9. **Show Career Readiness Score**

**Narration**: "Alex is currently 62% ready for a Data Scientist role, with a confidence interval based on assessment evidence."

---

### Act 4: Smart Recommendations (1 minute)

10. Navigate to **Recommendations Page**

**Narration**: "PathPilot's hybrid recommendation engine scores every resource across 8 features."

11. **Show a recommendation card** → Expand the explainability breakdown

**Narration**: "This Statistics lab is recommended because: high skill gap alignment, strong career relevance, meets prerequisite requirements, matches the beginner difficulty level, and fits the interactive format preference. Every recommendation is explainable."

12. **Show Next Best Action** on Dashboard

**Narration**: "The 'Next Best Action' widget tells the learner exactly what to do right now — no decision fatigue."

---

### Act 5: Adaptive Learning (1.5 minutes) ⭐ Key Differentiator

13. Navigate to **Dashboard** → Point out the current roadmap

**Narration**: "Here's where PathPilot gets really interesting. Watch what happens when Alex completes a learning activity."

14. **Simulate completing an assessment with a high score** (via the Assessment page or API call)

```bash
# If demonstrating via API:
curl -X POST http://localhost:8000/api/v1/adaptive/process-evidence \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"skill_id": "<statistics-skill-id>", "evidence_type": "assessment", "score": 0.87, "metadata": {"source": "diagnostic"}}'
```

15. **Show the Adaptation Banner** → "Your roadmap has been updated!"

**Narration**: "PathPilot detected mastery in Statistics based on the 87% score. It automatically: updated the proficiency model using Bayesian-inspired weighting, classified the mastery state, recalculated skill gaps, and adapted the roadmap — all in real time."

16. **Show the Adaptation Timeline** → Expand to show the full adaptation history

**Narration**: "Every adaptation is tracked with the trigger, the state change, and the pedagogical reason. This is fully auditable, explainable AI."

17. **Show Roadmap changes** → Statistics milestone marked complete, ML unlocked

---

### Act 6: AI Mentor (45 seconds)

18. Navigate to **AI Assistant**

19. Ask: **"What should I learn next and why?"**

**Narration**: "The AI mentor uses tool-calling to access real learner data — your actual skills, your roadmap, your gaps. It doesn't hallucinate career advice. It gives grounded, personalized guidance."

20. Ask: **"Why did my roadmap change?"**

**Narration**: "The mentor can explain any adaptation event, referencing the specific evidence and proficiency update that triggered it."

---

### Act 7: Closing (30 seconds)

**Narration**: "PathPilot transforms learning from a static course catalog into a continuously adaptive, evidence-based system. It diagnoses, recommends, adapts, and explains — creating a closed loop that gets smarter with every interaction."

**Key Metrics to Mention**:
- 84 backend tests, 19 frontend tests — all passing
- 0% prerequisite violation rate in recommendations
- 100% benchmark accuracy across 15 adaptive scenarios
- Sub-50ms semantic search latency

---

## Troubleshooting

| Issue | Solution |
| :--- | :--- |
| Backend won't start | Check `.env` has correct `DATABASE_URL` |
| Frontend 500 errors | Ensure backend is running on port 8000 |
| No seed data | Backend auto-seeds on startup; check logs |
| Auth errors | In dev mode, use `dev-token-<user-id>` format |
| Embedding errors | Falls back to deterministic provider if no API key |

## Backup Plan

If live demo fails, present:
1. Backend test suite output (84/84 passing)
2. Architecture diagrams from `docs/final-architecture.md`
3. API docs at `http://localhost:8000/docs` (Swagger UI)
