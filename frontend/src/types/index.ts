export interface User {
  id: string;
  name: string;
  email: string;
  selectedCareer?: string;
  xp: number;
  streak: number;
  completedSkillIds?: string[];
  currentStepIndex?: number;
  realmLevel?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Foundation' | 'Core Skills' | 'Advanced Skills' | 'Industry Readiness';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  level: number;
  prerequisites: string[];
  description: string;
  estimated_minutes: number;
  market_demand?: 'Very High' | 'High' | 'Moderate';
  tools?: string[];
}

export interface Career {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  skills: Skill[];
  marketDemandScore?: number; // 0 - 100
  avgSalaryRange?: string;
  trendingTools?: string[];
  isPrototypeData?: boolean;
}

export interface Question {
  id: string;
  career_id: string;
  skill_id: string;
  skill_name: string;
  difficulty: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface TopicScore {
  skill_id: string;
  skill_name: string;
  score: number;
  strength_level: 'Strong' | 'Moderate' | 'Weak';
  correct_count: number;
  total_count: number;
}

export interface AssessmentReport {
  assessment_id: string;
  overall_score: number;
  topic_scores: TopicScore[];
  strong_topics: { skill_id: string; name: string; score: number }[];
  moderate_topics: { skill_id: string; name: string; score: number }[];
  weak_topics: { skill_id: string; name: string; score: number }[];
  recommendations: Recommendation[];
  completed_skills?: string[];
}

export interface Recommendation {
  skill_id: string;
  skill_name: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  action: string;
  estimated_minutes: number;
  current_score: number;
  user_feedback?: 'useful' | 'not_useful';
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  badges: number;
  career: string;
  is_current: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

