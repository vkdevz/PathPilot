# PathPilot 2.0 — Skill Knowledge Graph Architecture

## 1. Overview & Architectural Principles

PathPilot 2.0 uses a normalized, relational knowledge graph embedded directly within PostgreSQL (SQLAlchemy 2.0 async). No dedicated external graph database (e.g., Neo4j) is required. Graph traversal, transitive ancestor resolution, downstream impact calculation, and cycle detection are performed via high-performance in-memory DAG algorithms within the `SkillGraphService`.

```
                    ┌─────────────────────────┐
                    │    Career Definition     │
                    │   (Target Competencies) │
                    └───────────┬─────────────┘
                                │ (CareerSkill)
                                ▼
                    ┌─────────────────────────┐
                    │    Relational Schema    │
                    │  (PostgreSQL Normalized)│
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │    SkillGraphService    │
                    │   (In-Memory DAG Cache) │
                    └─────┬─────────────┬─────┘
                          │             │
        ┌─────────────────▼──┐       ┌──▼──────────────────┐
        │ Transitive Ancestors│       │ Downstream Unlocking│
        │ & Depth Tracking   │       │ & Impact Scoring    │
        └────────────────────┘       └─────────────────────┘
```

---

## 2. PostgreSQL Relational Data Model

### 2.1 Skill Entity (`skills`)
- `id` (UUID PK): Unique skill identifier.
- `slug` (VARCHAR unique): URL-safe slug (e.g., `stats-ds`, `ml-foundations`).
- `name` (VARCHAR): Human-readable name.
- `category` (VARCHAR): Taxonomy category (`Foundation`, `Core`, `Specialized`, `Industry`).
- `domain` (VARCHAR): Domain grouping (`Data & Analytics`, `AI Engineering`, `Cloud & DevOps`, `Cybersecurity`, `Full-Stack Development`, `Data Engineering`).
- `difficulty` (VARCHAR): `Beginner`, `Intermediate`, `Advanced`.
- `level` (INTEGER): Progression level ($1-10$).
- `description` (TEXT): Comprehensive skill explanation.
- `estimated_minutes` (INTEGER): Estimated study duration.
- `is_active` (BOOLEAN): Soft delete / activation status.
- `metadata_json` (JSONB): Extensible domain tags, aliases, and certification references.

### 2.2 Directed Edge Entity (`skill_prerequisites`)
- `id` (UUID PK): Edge identifier.
- `skill_id` (UUID FK -> `skills.id`): Target/dependent skill.
- `prerequisite_skill_id` (UUID FK -> `skills.id`): Source/prerequisite skill.
- `relationship_type` (VARCHAR): `mandatory`, `recommended`, `soft`.
- `strength` (FLOAT): Edge weight in $[0.1, 1.0]$ (default $1.0$).
- `is_mandatory` (BOOLEAN): Whether downstream mastery is strictly blocked.
- *Constraint*: `UNIQUE(skill_id, prerequisite_skill_id)` preventing duplicate edges.

### 2.3 Career Skill Requirements (`career_skills`)
- `career_id` (UUID FK), `skill_id` (UUID FK).
- `weight` (FLOAT): Relative importance in $[0.0, 1.0]$.
- `importance` (VARCHAR): `critical`, `high`, `medium`, `low`.
- `target_proficiency` (FLOAT): Target threshold in $[0.0, 1.0]$ (e.g., $0.85$ for Critical ML, $0.75$ for Data Viz).

---

## 3. Graph Operations & Algorithms

### 3.1 Transitive Ancestor Traversal (Upstream Prerequisites)
Uses Breadth-First Search (BFS) starting from target skill $S$:
- Discovers all transitive prerequisite ancestors $(P, \text{depth})$.
- Computes maximum prerequisite depth $\text{depth}(S) = \max_{p \in \text{direct}(S)} (1 + \text{depth}(p))$.
- Foundation skills are identified when $\text{depth}(S) = 0$ and $\text{prerequisites}(S) = \emptyset$.

### 3.2 Downstream Descendant Traversal & Impact Scoring
When assessing skill $S$, downstream impact quantifies how many career skills are unlocked:
$$\text{Impact}(S) = \min\left(1.0, \sum_{d \in \text{Descendants}(S)} 0.80^{\text{depth}(S, d) - 1} \times 0.20\right)$$
- Immediate downstream competencies ($\text{depth}=1$) contribute $0.20 \times 1.0 = 0.20$.
- Secondary dependencies ($\text{depth}=2$) contribute $0.20 \times 0.80 = 0.16$.
- Tertiary dependencies ($\text{depth}=3$) contribute $0.20 \times 0.64 = 0.128$.

### 3.3 Cycle Detection & Integrity Validation (Tarjan DFS)
To ensure the skill taxonomy is a strict Directed Acyclic Graph (DAG), `SkillGraphService` implements Tarjan's 3-color DFS cycle detection (`WHITE`, `GRAY`, `BLACK`):
- `detect_cycles()` detects any back-edges ($u \to v$ where $v \in \text{GRAY}$).
- `validate_graph()` checks for:
  1. Cycles.
  2. Orphaned skills (disconnected non-foundation skills).
  3. Missing foreign key references.
  4. Duplicate or self-referencing edges ($u \to u$).
  5. Inactive skill references.

---

## 4. API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/skills` | List all skills with taxonomy, domain, prerequisites & downstream lists | No |
| `GET` | `/api/v1/skills/{slug}` | Detailed skill node with direct prerequisite & downstream trees | No |
| `GET` | `/api/v1/skills/{slug}/prerequisites` | Full DAG tree, transitive ancestors with depths, downstream unlocks | No |
| `GET` | `/api/v1/skills/graph/validate` | Administrative/Dev graph validation report & cycle audit | Yes |
| `GET` | `/api/v1/careers/{slug}/skills` | Career required competencies, importance levels, target proficiencies | No |
