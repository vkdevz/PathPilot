export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type SkillStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered';
export type FeedbackType = 'too_easy' | 'too_hard' | 'useful' | 'not_useful' | 'irrelevant';

export interface LearnerProfile {
  id: string;
  user_id: string;
  target_career_id?: string | null;
  target_career_name?: string | null;
  experience_level: string;
  learning_pace: string;
  preferred_format: string;
  weekly_hours_goal: number;
  xp: number;
  streak_days: number;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string | null;
  role?: 'learner' | 'admin' | string;
  profile?: LearnerProfile | null;
  created_at: string;
  updated_at: string;
}

export interface Career {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  market_demand_score: number;
  salary_range: string;
  total_skills?: number;
}

export interface CareerDetail extends Career {
  skills: Skill[];
  skill_weights: Record<string, number>;
  skill_importance?: Record<string, string>;
  target_proficiencies?: Record<string, number>;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: string;
  domain?: string;
  difficulty: Difficulty;
  level: number;
  description: string;
  estimated_minutes: number;
  is_active?: boolean;
  prerequisites: string[];
  downstream_skills?: string[];
  resource_count?: number;
}

export interface SkillPrerequisiteNode {
  id: string;
  slug: string;
  name: string;
  category: string;
  domain?: string;
  difficulty: string;
  level: number;
  relationship_type?: string;
  strength?: number;
  depth: number;
}

export interface SkillDetail extends Skill {
  prerequisite_nodes: SkillPrerequisiteNode[];
  downstream_nodes: SkillPrerequisiteNode[];
  metadata_json?: Record<string, any>;
}

export interface PrerequisiteGraphResponse {
  target_skill_id: string;
  target_skill_slug: string;
  target_skill_name: string;
  direct_prerequisites: SkillPrerequisiteNode[];
  transitive_prerequisites: SkillPrerequisiteNode[];
  downstream_unlocked: SkillPrerequisiteNode[];
  max_prerequisite_depth: number;
  is_foundation: boolean;
}

export interface LearnerSkill {
  id: string;
  skill_id: string;
  skill_slug: string;
  skill_name: string;
  category: string;
  domain?: string;
  score: number;
  proficiency?: number;
  confidence?: number;
  evidence_source?: string;
  assessment_score?: number | null;
  self_reported_score?: number | null;
  status: SkillStatus;
  last_assessed_at?: string | null;
}

export interface IntelligentSkillGap {
  skill_id: string;
  skill_slug: string;
  skill_name: string;
  category: string;
  domain: string;
  difficulty: string;
  level: number;
  current_proficiency: number;
  current_score: number;
  target_proficiency: number;
  target_score: number;
  raw_gap: number;
  confidence: number;
  evidence_source: string;
  career_importance: string;
  career_importance_score: number;
  career_weight: number;
  prerequisite_depth: number;
  is_prerequisite_met: boolean;
  unsatisfied_prerequisites: string[];
  transitive_prerequisites_count: number;
  downstream_skills_count: number;
  downstream_impact_score: number;
  is_bottleneck: boolean;
  is_foundation: boolean;
  readiness_state: string;
  gap_category: string;
  intelligent_priority_score: number;
  explanation: string;
}

export interface NextBestSkill {
  skill_id: string;
  skill_slug: string;
  skill_name: string;
  category: string;
  domain: string;
  difficulty: string;
  priority_score: number;
  is_bottleneck: boolean;
  readiness_state: string;
  reason: string;
  prerequisites_met: boolean;
  recommended_resource_id?: string | null;
  recommended_resource_title?: string | null;
}

export interface CareerReadinessSummary {
  career_id?: string | null;
  career_slug?: string | null;
  career_name: string;
  career_readiness_score: number;
  confidence_score: number;
  is_cold_start: boolean;
  required_skills_count: number;
  covered_skills_count: number;
  partial_skills_count: number;
  missing_skills_count: number;
  critical_gaps_count: number;
  blocked_skills_count: number;
  strongest_skills: string[];
  biggest_gaps: IntelligentSkillGap[];
  bottlenecks: IntelligentSkillGap[];
  next_best_skill?: NextBestSkill | null;
  skill_gaps: IntelligentSkillGap[];
}

export interface GraphValidationReport {
  is_valid: boolean;
  total_skills: number;
  total_edges: number;
  cycles_detected: string[][];
  orphan_skills: string[];
  missing_references: string[];
  duplicate_edges: string[];
  inactive_skills: string[];
}


export interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string;
  resource_type: string;
  url?: string | null;
  difficulty: Difficulty;
  estimated_minutes: number;
  provider: string;
  is_interactive: boolean;
  content?: string | null;
  skills_taught?: string[];
}


export interface FeatureScoreBreakdown {
  skill_gap: number;
  career_alignment: number;
  roadmap_affinity: number;
  semantic_similarity: number;
  difficulty_fit: number;
  format_preference: number;
  pacing_fit: number;
  feedback_prior: number;
  composite_score: number;
}

export interface Recommendation {
  id: string;
  resource_id: string;
  slug: string;
  title: string;
  description: string;
  resource_type: string;
  url?: string | null;
  difficulty: Difficulty;
  estimated_minutes: number;
  provider: string;
  is_interactive: boolean;
  skills_taught: string[];
  target_skill_slug?: string | null;
  target_skill_name?: string | null;
  relevance_score: number;
  match_tier: string;
  explanation_reasons: string[];
  feature_breakdown?: FeatureScoreBreakdown | null;
}

export interface NextBestAction {
  resource_id: string;
  slug: string;
  title: string;
  description: string;
  resource_type: string;
  difficulty: Difficulty;
  estimated_minutes: number;
  provider: string;
  url?: string | null;
  is_interactive: boolean;
  target_skill_name: string;
  target_skill_slug: string;
  current_skill_score: number;
  target_milestone_step?: number | null;
  relevance_score: number;
  headline: string;
  primary_reason: string;
  reasons: string[];
  feature_breakdown?: FeatureScoreBreakdown | null;
}

export interface RecommendationFeedbackPayload {
  resource_id: string;
  feedback_type: 'started' | 'completed' | 'saved' | 'dismissed' | 'too_easy' | 'too_hard' | 'helpful' | 'irrelevant';
  rating?: number;
  notes?: string;
}

export interface RecommendationObservability {
  algorithm_version: string;
  engine_health: string;
  weights_configuration: Record<string, number>;
  total_recommendation_runs: number;
  avg_latency_ms: number;
  avg_intra_list_diversity: number;
  total_feedbacks_recorded: number;
}

export interface BaselineComparisonMetric {
  model_name: string;
  precision_at_k: number;
  recall_at_k: number;
  ndcg_at_k: number;
  intra_list_diversity: number;
  catalog_coverage_pct: number;
  prerequisite_violation_rate: number;
  avg_latency_ms: number;
}

export interface RecommendationEvaluationReport {
  status: string;
  k: number;
  total_test_learners: number;
  comparison: BaselineComparisonMetric[];
  hybrid_summary: Record<string, any>;
  total_duration_ms: number;
}

export interface Question {
  id: string;
  skill_id: string;
  skill_name?: string;
  difficulty: Difficulty;
  question_text: string;
  options: string[];
}

export interface QuestionDetail extends Question {
  correct_answer_index: number;
  explanation: string;
}

export interface AssessmentDetail {
  id: string;
  career_id: string;
  career_name?: string;
  career_slug?: string;
  title: string;
  description: string;
  total_questions: number;
  passing_score: number;
  questions: Question[];
}

export interface TopicScore {
  skill_id?: string;
  name: string;
  score: number;
}

export interface AssessmentResult {
  attempt_id?: string;
  career_id?: string;
  career_slug?: string;
  career_name?: string;
  overall_score: number;
  position_rank?: string;
  percentile_rank?: number;
  passed?: boolean;
  topic_breakdown?: Record<string, number>;
  correct_count?: number;
  total_questions?: number;
  unlocked_skills?: string[];
  strong_topics?: TopicScore[];
  moderate_topics?: TopicScore[];
  weak_topics?: TopicScore[];
  recommendations?: Array<{
    skill_name: string;
    resource_title: string;
    resource_slug: string;
    estimated_minutes: number;
    priority: string;
  }>;
  completed_at?: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  topic: string;
  duration_minutes: number;
  session_date: string;
  notes?: string | null;
  xp_earned: number;
  resource_id?: string | null;
  created_at?: string;
}

export interface StudyTimeSummary {
  today_minutes: number;
  this_week_minutes: number;
  this_week_sessions: number;
  this_month_minutes: number;
  total_minutes: number;
  total_sessions: number;
  total_xp: number;
  streak_days: number;
}

export interface CompleteResourceResult {
  id: string;
  user_id: string;
  resource_id: string;
  resource_title: string;
  resource_type: string;
  status: string;
  xp_earned: number;
  already_completed: boolean;
  completed_at: string;
}

export interface LearningPathItem {
  id: string;
  skill_id: string;
  skill_slug: string;
  skill_name: string;
  resource_id?: string | null;
  resource_title?: string | null;
  resource_type?: string | null;
  resource_url?: string | null;
  resource?: Resource | null;
  step_order: number;
  status: SkillStatus;
  category?: string;
  recommendation_reason?: string | null;
  estimated_hours: number;
}

export type MilestoneItem = LearningPathItem;

export interface LearningPath {
  id: string;
  user_id: string;
  career_id: string;
  career_name: string;
  career_slug: string;
  status: string;
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
  items: LearningPathItem[];
  milestones?: LearningPathItem[];
}

export interface ProgressLog {
  id: string;
  user_id: string;
  resource_id: string;
  time_spent_minutes: number;
  status: string;
  completed_at?: string | null;
  created_at: string;
}

export interface HeatmapDay {
  date: string;
  minutes: number;
  level: number;
  intensity?: number;
}

export interface LeaderboardUser {
  rank: number;
  user_id: string;
  display_name: string;
  name?: string;
  career?: string;
  avatar_url?: string | null;
  xp: number;
  streak_days: number;
  streak?: number;
  is_current?: boolean;
}

export interface FeedbackItem {
  id: string;
  user_id: string;
  learning_path_item_id?: string | null;
  feedback_type: FeedbackType;
  notes?: string | null;
  created_at: string;
}

// AI Assistant & Semantic Retrieval Types
export interface ToolCallRecord {
  tool_name: string;
  tool_input: Record<string, any>;
  tool_output: Record<string, any>;
  status: 'success' | 'error';
  execution_time_ms: number;
}

export interface AITelemetry {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  latency_ms?: number;
  tools_invoked?: string[];
  safety_status?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: ToolCallRecord[] | null;
  created_at?: string;
}

export interface ConversationSummary {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at?: string | null;
  message_count: number;
  last_message_preview?: string | null;
}

export interface AIChatResponse {
  conversation_id: string;
  user_message_id: string;
  assistant_message_id: string;
  role: string;
  content: string;
  tool_calls: ToolCallRecord[];
  telemetry: AITelemetry;
  created_at: string;
}

export interface RetrievedResourceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  resource_type: string;
  url?: string | null;
  difficulty: string;
  estimated_minutes: number;
  provider: string;
  is_interactive: boolean;
  skills_taught: string[];
  similarity_score: number;
  relevance_percentage: number;
  match_tier: string;
  reasons: string[];
}

export interface RetrievedSkillItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  difficulty?: string | null;
  level: number;
  estimated_minutes: number;
  description: string;
  similarity_score: number;
  relevance_percentage: number;
}

export interface RetrievedCareerItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon?: string | null;
  market_demand_score?: number | null;
  salary_range?: string | null;
  description: string;
  similarity_score: number;
  relevance_percentage: number;
}

export interface UnifiedSearchResponse {
  query: string;
  resources: RetrievedResourceItem[];
  skills: RetrievedSkillItem[];
  careers: RetrievedCareerItem[];
}

export interface IndexStats {
  total_embeddings: number;
  entity_breakdown: Record<string, number>;
  model_name: string;
  dimensions: number;
  pgvector_ready: boolean;
}

export interface RetrievalEvaluationReport {
  status: string;
  k: number;
  total_benchmark_queries: number;
  metrics: {
    precision_at_k?: number;
    recall_at_k?: number;
    mrr?: number;
    ndcg_at_k?: number;
    avg_query_latency_ms?: number;
    [key: string]: any;
  };
  total_duration_ms: number;
  queries: Array<{
    query: string;
    entity_type: string;
    retrieved_slugs: string[];
    similarity_scores: number[];
    precision_at_k: number;
    recall_at_k: number;
    reciprocal_rank: number;
    ndcg_at_k: number;
    latency_ms: number;
  }>;
}

// ==========================================
// Phase 8: Adaptive Learning Engine Types
// ==========================================

export interface AdaptiveSkillState {
  skill_id: string;
  skill_name: string;
  category: string;
  proficiency: number; // 0.0 - 1.0
  score_pct: number;   // 0 - 100
  confidence: number;  // 0.0 - 1.0
  mastery_state: 'NOT_STARTED' | 'DEVELOPING' | 'PRACTICING' | 'NEAR_MASTERY' | 'MASTERED';
  evidence_source: string;
  status: string;
}

export interface AdaptationEvent {
  id: string;
  event_type: 'SKILL_UPDATED' | 'MASTERY_DETECTED' | 'STRUGGLE_DETECTED' | 'DIFFICULTY_CHANGED' | 'ROADMAP_CHANGED' | 'RECOMMENDATIONS_REGENERATED' | 'INTERVENTION_TRIGGERED' | 'GOAL_CHANGED';
  trigger: string;
  reason: string;
  previous_state: Record<string, any>;
  new_state: Record<string, any>;
  algorithm_version: string;
  created_at?: string;
}

export interface LearnerAdaptiveState {
  user_id: string;
  display_name: string;
  target_career: string;
  career_readiness_pct: number;
  estimated_learning_pace: 'FAST' | 'NORMAL' | 'SLOW' | 'UNKNOWN';
  pace_velocity_ratio: number;
  skills: AdaptiveSkillState[];
  next_best_skill?: {
    skill_name: string;
    is_bottleneck: boolean;
    readiness_state: string;
    reason: string;
  } | null;
  bottleneck_skills: Array<{
    skill_id: string;
    skill_name: string;
    downstream_impact_score: number;
    downstream_skills_count: number;
  }>;
  recent_adaptations: AdaptationEvent[];
}

export interface ProgressHistoryPoint {
  id: string;
  skill_id: string;
  skill_name: string;
  proficiency: number;
  score_pct: number;
  confidence: number;
  mastery_state: string;
  struggle_state: string;
  trigger_event?: string;
  created_at?: string;
}

export interface RoadmapVersion {
  id: string;
  version_number: number;
  learning_path_id: string;
  reason: string;
  milestones_count: number;
  milestones: MilestoneItem[];
  is_active: boolean;
  created_at?: string;
}

export interface FeedbackInterpretationResult {
  original_comment: string;
  difficulty_signal: 'TOO_EASY' | 'APPROPRIATE' | 'TOO_HARD';
  format_preference?: string | null;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  confidence: number;
  pedagogical_tags: string[];
}

export interface AdaptiveBenchmarkReport {
  benchmark_name: string;
  algorithm_version: string;
  total_scenarios: number;
  passed_scenarios: number;
  accuracy_pct: number;
  mastery_detection_accuracy: number;
  struggle_detection_precision: number;
  false_adaptation_rate: number;
  prerequisite_safety_rate: number;
  latency_ms: number;
  scenarios: Array<{
    id: number;
    name: string;
    passed: boolean;
    expected: string;
    actual: string;
  }>;
  timestamp: string;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  display_name: string;
  role: 'learner' | 'admin' | string;
  target_career_name?: string | null;
  target_career_slug?: string | null;
  experience_level: string;
  learning_pace: string;
  weekly_hours_goal: number;
  xp: number;
  streak_days: number;
  total_study_minutes: number;
  total_study_sessions: number;
  total_completed_learning: number;
  created_at: string;
  updated_at?: string | null;
}

export interface AdminOverviewStats {
  total_registered_users: number;
  total_learners: number;
  total_admins: number;
  total_xp_awarded: number;
  total_study_minutes_logged: number;
  total_study_sessions_logged: number;
  total_verified_completions: number;
  career_distribution: Array<{
    career_name: string;
    learner_count: number;
  }>;
  recent_registrations: AdminUserRecord[];
}

