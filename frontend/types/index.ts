export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type SkillStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered';
export type FeedbackType = 'too_easy' | 'too_hard' | 'useful' | 'not_useful' | 'irrelevant';

export interface LearnerProfile {
  id: string;
  user_id: string;
  target_career_id?: string | null;
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
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: string;
  difficulty: Difficulty;
  level: number;
  description: string;
  estimated_minutes: number;
  prerequisites: string[];
}

export interface LearnerSkill {
  id: string;
  skill_id: string;
  skill_slug: string;
  skill_name: string;
  category: string;
  score: number;
  status: SkillStatus;
  last_assessed_at?: string | null;
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
  skills_taught?: string[];
}

export interface Question {
  id: string;
  skill_id: string;
  skill_name?: string | null;
  difficulty: Difficulty;
  question_text: string;
  options: string[];
}

export interface AssessmentDetail {
  id: string;
  career_id: string;
  career_name: string;
  title: string;
  total_questions: number;
  questions: Question[];
}

export interface TopicScore {
  skill_id: string;
  skill_name: string;
  score: number;
  strength_level: 'Strong' | 'Moderate' | 'Weak';
  correct_count: number;
  total_count: number;
}

export interface AssessmentResult {
  attempt_id: string;
  overall_score: number;
  strong_topics: Array<{ skill_id: string; name: string; score: number }>;
  moderate_topics: Array<{ skill_id: string; name: string; score: number }>;
  weak_topics: Array<{ skill_id: string; name: string; score: number }>;
  topic_scores: TopicScore[];
  completed_at: string;
}

export interface MilestoneItem {
  id: string;
  step_order: number;
  skill_id: string;
  skill_slug: string;
  skill_name: string;
  category: string;
  status: SkillStatus;
  recommendation_reason?: string | null;
  estimated_hours: number;
  resource?: Resource | null;
  completed_at?: string | null;
}

export interface LearningPath {
  id: string;
  user_id: string;
  career_id: string;
  career_name: string;
  status: string;
  milestones: MilestoneItem[];
  created_at: string;
  updated_at: string;
}

export interface HeatmapDay {
  date: string;
  minutes: number;
  intensity: number;
}

export interface LeaderboardUser {
  rank: number;
  user_id: string;
  name: string;
  xp: number;
  streak: number;
  career: string;
  is_current: boolean;
}
