# PathPilot AI 2.0 — PostgreSQL Relational Schema

## 1. Overview
The database layer is built on PostgreSQL 16 with the `pgvector` extension enabled for semantic similarity embeddings.

---

## 2. Table Specifications

### 1. `users`
- `id` (VARCHAR(36), PK, UUID matching Supabase `auth.users.id`)
- `email` (VARCHAR(255), UNIQUE, INDEX)
- `display_name` (VARCHAR(255))
- `avatar_url` (VARCHAR(512))
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2. `learner_profiles`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, UNIQUE, INDEX)
- `target_career_id` (VARCHAR(36), FK -> `careers.id` ON DELETE SET NULL)
- `experience_level` (VARCHAR(50), default 'beginner')
- `learning_pace` (VARCHAR(50), default 'moderate')
- `preferred_format` (VARCHAR(50), default 'interactive')
- `weekly_hours_goal` (INTEGER, default 5)
- `xp` (INTEGER, default 0)
- `streak_days` (INTEGER, default 1)
- `preferences` (JSON)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 3. `careers`
- `id` (VARCHAR(36), PK)
- `slug` (VARCHAR(100), UNIQUE, INDEX)
- `name` (VARCHAR(255))
- `category` (VARCHAR(100), INDEX)
- `description` (TEXT)
- `icon` (VARCHAR(50))
- `market_demand_score` (INTEGER)
- `salary_range` (VARCHAR(100))
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 4. `career_skills`
- `career_id` (VARCHAR(36), FK -> `careers.id` ON DELETE CASCADE, PK)
- `skill_id` (VARCHAR(36), FK -> `skills.id` ON DELETE CASCADE, PK)
- `weight` (FLOAT)
- `is_mandatory` (BOOLEAN)
- `recommended_order` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 5. `skills`
- `id` (VARCHAR(36), PK)
- `slug` (VARCHAR(100), UNIQUE, INDEX)
- `name` (VARCHAR(255))
- `category` (VARCHAR(100))
- `difficulty` (VARCHAR(50))
- `level` (INTEGER)
- `description` (TEXT)
- `estimated_minutes` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 6. `skill_prerequisites`
- `skill_id` (VARCHAR(36), FK -> `skills.id` ON DELETE CASCADE, PK)
- `prerequisite_skill_id` (VARCHAR(36), FK -> `skills.id` ON DELETE CASCADE, PK)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 7. `learner_skills`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, INDEX)
- `skill_id` (VARCHAR(36), FK -> `skills.id` ON DELETE CASCADE, INDEX)
- `score` (FLOAT)
- `status` (VARCHAR(50))
- `last_assessed_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 8. `resources`
- `id` (VARCHAR(36), PK)
- `slug` (VARCHAR(100), UNIQUE, INDEX)
- `title` (VARCHAR(255))
- `description` (TEXT)
- `resource_type` (VARCHAR(50), INDEX)
- `url` (VARCHAR(512))
- `difficulty` (VARCHAR(50))
- `estimated_minutes` (INTEGER)
- `provider` (VARCHAR(100))
- `is_interactive` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 9. `resource_skills`
- `resource_id` (VARCHAR(36), FK -> `resources.id` ON DELETE CASCADE, PK)
- `skill_id` (VARCHAR(36), FK -> `skills.id` ON DELETE CASCADE, PK)
- `relevance_score` (FLOAT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 10. `assessments`
- `id` (VARCHAR(36), PK)
- `career_id` (VARCHAR(36), FK -> `careers.id` ON DELETE CASCADE, INDEX)
- `title` (VARCHAR(255))
- `description` (TEXT)
- `total_questions` (INTEGER)
- `passing_score` (FLOAT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 11. `questions`
- `id` (VARCHAR(36), PK)
- `assessment_id` (VARCHAR(36), FK -> `assessments.id` ON DELETE CASCADE, INDEX)
- `skill_id` (VARCHAR(36), FK -> `skills.id` ON DELETE CASCADE, INDEX)
- `difficulty` (VARCHAR(50))
- `question_text` (TEXT)
- `options` (JSON)
- `correct_answer_index` (INTEGER)
- `explanation` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 12. `assessment_attempts`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, INDEX)
- `assessment_id` (VARCHAR(36), FK -> `assessments.id` ON DELETE CASCADE, INDEX)
- `overall_score` (FLOAT)
- `topic_breakdown` (JSON)
- `submitted_answers` (JSON)
- `completed_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 13. `learning_paths`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, INDEX)
- `career_id` (VARCHAR(36), FK -> `careers.id` ON DELETE CASCADE)
- `status` (VARCHAR(50))
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 14. `learning_path_items`
- `id` (VARCHAR(36), PK)
- `learning_path_id` (VARCHAR(36), FK -> `learning_paths.id` ON DELETE CASCADE, INDEX)
- `skill_id` (VARCHAR(36), FK -> `skills.id` ON DELETE CASCADE)
- `resource_id` (VARCHAR(36), FK -> `resources.id` ON DELETE SET NULL)
- `step_order` (INTEGER)
- `status` (VARCHAR(50))
- `recommendation_reason` (TEXT)
- `estimated_hours` (INTEGER)
- `completed_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 15. `progress`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, INDEX)
- `resource_id` (VARCHAR(36), FK -> `resources.id` ON DELETE CASCADE)
- `time_spent_minutes` (INTEGER)
- `status` (VARCHAR(50))
- `completed_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 16. `feedback`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, INDEX)
- `learning_path_item_id` (VARCHAR(36), FK -> `learning_path_items.id` ON DELETE CASCADE)
- `feedback_type` (VARCHAR(50))
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 17. `conversations` & `messages`
- `conversations`: `id`, `user_id` (FK -> `users.id`), `title`, `created_at`, `updated_at`
- `messages`: `id`, `conversation_id` (FK -> `conversations.id`), `role`, `content`, `tool_calls`, `created_at`, `updated_at`

### 18. `embeddings`
- `id` (VARCHAR(36), PK)
- `entity_type` (VARCHAR(50), INDEX)
- `entity_id` (VARCHAR(36), INDEX)
- `embedding` (VECTOR(1536))
- `content_hash` (VARCHAR(64))
- `created_at`, `updated_at` (TIMESTAMPTZ)
