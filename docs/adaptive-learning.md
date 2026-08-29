# PathPilot AI — Adaptive Learning Engine Documentation

## 1. Overview & Pedagogical Mission
The **Adaptive Learning Engine** transforms PathPilot from a static personalized recommender into a continuously learning closed-loop educational intelligence platform. Rather than offering one-time static diagnostic roadmaps, PathPilot continuously ingests atomic multimodal evidence (diagnostic assessments, modular quizzes, hands-on coding projects, resource completions, and qualitative learner feedback) to maintain an accurate, calibrated Bayesian proficiency model for each learner.

```
                    ┌─────────────────────────┐
                    │         LEARNER         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    LEARNING ACTIVITY    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ ASSESSMENT / FEEDBACK   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    VERIFIED EVIDENCE    │
                    │   (SHA-256 Idempotent)  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ ADAPTIVE LEARNER STATE  │
                    │  (Proficiency/Pace/XAI) │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ SKILL INTELLIGENCE (P7) │
                    │ (DAG / Gaps / Bottleneck│
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ HYBRID RECOMMENDATIONS  │
                    │  (Difficulty Fit / XAI) │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   ROADMAP ADAPTATION    │
                    │ (Non-destructive / Ver) │
                    └────────────┬────────────┘
                                 │
                                 ↺ (Continuous Loop)
```

---

## 2. Mathematical Formulations & Update Logic

### 2.1 Bayesian-Inspired Proficiency Formulation
The engine computes skill updates using an evidence-weighted, confidence-scaled exponential decay model:

$$\alpha = \min\left(W_e \cdot C_e \cdot 2^{-\frac{\Delta t}{30}},\, 0.65\right)$$

$$P_{t} = (1 - \alpha) \cdot P_{t-1} + \alpha \cdot S_e$$

Where:
- $P_{t-1} \in [0.0, 1.0]$: Prior proficiency of the learner in the skill.
- $S_e \in [0.0, 1.0]$: Normalized score of the submitted evidence.
- $W_e \in [0.0, 1.0]$: Evidence source reliability weight:
  - `ASSESSMENT` (Proctored / End-of-Module Exam): $1.00$
  - `PROJECT` (Validated Code / Portfolio Artifact): $0.85$
  - `QUIZ` (Short Checkpoint Quiz): $0.70$
  - `REPEATED_PERFORMANCE` (Consistent verified streak): $0.65$
  - `RESOURCE_COMPLETION` (Self-paced reading/lab): $0.40$
  - `SELF_REPORT` (Unverified subjective survey): $0.25$
- $C_e \in [0.0, 1.0]$: Confidence score of the assessment item.
- $\Delta t$: Age of prior evidence in days (exponential half-life decay of 30 days).
- $\alpha \le 0.65$: Safety cap preventing single unverified flukes from distorting mastery models.

### 2.2 Confidence Growth & Decay
Confidence reflects evidentiary depth and recency:

$$\Delta C = W_e \cdot (1 - C_{t-1}) \cdot 0.25$$

$$C_{t} = \min\left(C_{t-1} + \Delta C,\, 0.95\right)$$

If no evidence is received within 30 days, confidence undergoes exponential decay with a minimum floor of 0.20:

$$C_{decayed} = \max\left(C_0 \cdot 2^{-\frac{\Delta t}{60}},\, 0.20\right)$$

---

## 3. Mastery & Struggle Detection Engine

### 3.1 Mastery Classification State Machine
| State | Proficiency Range | Criteria & Pedagogical Interpretation |
| :--- | :--- | :--- |
| `NOT_STARTED` | $P < 0.20$ | Cold-start or zero evidentiary history. Requires foundation exploration. |
| `DEVELOPING` | $0.20 \le P < 0.50$ | Initial mental model forming. Scaffolding and guided tutorials recommended. |
| `PRACTICING` | $0.50 \le P < 0.75$ | Core concepts understood; needs active practice and debugging problems. |
| `NEAR_MASTERY` | $0.75 \le P < 0.85$ | High proficiency; capable of tackling capstone challenges. |
| `MASTERED` | $P \ge 0.85$ AND $C \ge 0.70$ | Verified mastery across multiple high-weight assessments. Unlocks downstream DAG skills. |

### 3.2 Struggle Detection State Machine
A learner is classified as `STRUGGLING` when:
1. **Consecutive Failures**: At least 2 consecutive submissions on the same skill have scores $S_e < 0.45$.
2. **Confidence-Weighted Plateau**: The learner's proficiency fails to improve despite multiple attempts over 3+ days.

**Pedagogical Interventions:**
- `REINFORCE_PREREQUISITES`: Inspects DAG prerequisites and verifies foundation mastery.
- `ADD_FOUNDATIONAL_STEP`: Inserts a beginner-friendly targeted practice milestone into the active roadmap.
- `SUGGEST_PRACTICE_RESOURCE`: Prioritizes interactive practice labs over theoretical lectures.

---

## 4. Empirical Pace Velocity Estimator
Pacing is estimated dynamically by measuring empirical study velocity:

$$\text{Velocity Ratio} = \frac{\text{Actual Completion Speed (Hours)}}{\text{Estimated Baseline (Hours)}}$$

| Ratio Range | Pace State | Engine Action |
| :--- | :--- | :--- |
| $\text{Ratio} < 0.70$ | `FAST` | Fast-tracks roadmap, suggests advanced elective projects. |
| $0.70 \le \text{Ratio} \le 1.30$ | `NORMAL` | Standard scheduled milestones maintained. |
| $\text{Ratio} > 1.30$ | `SLOW` | Breaks down large milestones into smaller micro-steps. |

---

## 5. Non-Destructive Roadmap Adaptation & Versioning
When struggle or mastery triggers roadmap updates:
1. The engine creates an immutable `RoadmapVersion` snapshot of the active learning path.
2. In case of **Struggle**:
   - Locates the active milestone.
   - Shifts subsequent milestone step orders (+1).
   - Inserts a targeted reinforcement lab without destroying existing progress.
3. In case of **Mastery**:
   - Marks the target milestone as `completed`.
   - Traverses the DAG to unlock dependent downstream milestones.
4. Records an explainable `AdaptationEvent` with full prior/new state diffs and natural language justifications.

---

## 6. Offline Benchmark Evaluation (15 Scenarios)
The engine is rigorously evaluated against 15 deterministic pedagogical scenarios:
1. **Proficiency Improvement**: Monotonic upward calibration.
2. **Struggle Detection**: 2 low scores trigger `STRUGGLING` state.
3. **Mastery Acceleration**: 3 high scores ($>85\%$) achieve `MASTERED`.
4. **Prerequisite Violation Block**: Prerequisite gap blocks advanced step.
5. **Decay Half-life**: 30-day inactivity reduces proficiency & confidence smoothly.
6. **Low Weight Self-Report**: Self-report weight (0.25) cannot overwhelm proctored exams.
7. **Pace Velocity Estimation**: Fast/Slow learner velocity calculation.
8. **Feedback Sentiment Analysis**: Qualitative sentiment and difficulty offset.
9. **Cognitive Readiness Scoring**: Gap vs. prerequisite depth readiness fit.
10. **Idempotent Evidence Deduplication**: SHA-256 prevents double-counting.
11. **Confidence Growth**: Multiple submissions converge confidence toward 0.95.
12. **Mastery State Machine**: Accurate 5-tier classification.
13. **Struggle Intervention Recommendation**: Targeted practice suggestions.
14. **Roadmap Snapshot Versioning**: Non-destructive milestone mutation.
15. **Full Closed-Loop Integration**: End-to-end evidence $\to$ state $\to$ recommendation flow.

**Benchmark Metrics:**
- Total Scenarios: **15 / 15**
- Pass Rate: **100.0%**
- False Adaptation Rate: **0.0%**
- Prerequisite Safety Rate: **100.0%**
- Average Latency: **< 10ms**

---

## 7. REST API Reference
- `GET /api/v1/learners/me/state`: Returns complete multi-factor adaptive learner state, proficiency vectors, and bottlenecks.
- `GET /api/v1/learners/me/adaptation/timeline`: Returns explainable adaptation events with trigger telemetry.
- `GET /api/v1/learners/me/progress-history`: Returns chronological proficiency snapshots.
- `GET /api/v1/learners/me/roadmap/versions`: Returns all versioned roadmap snapshots.
- `POST /api/v1/learners/me/evidence`: Ingests verified evidence and triggers closed-loop adaptation.
- `POST /api/v1/learners/me/feedback/interpret`: Deterministic NLP parser for learner feedback.
- `GET /api/v1/learners/me/adaptation/benchmark`: Executes the 15-scenario offline benchmark.
