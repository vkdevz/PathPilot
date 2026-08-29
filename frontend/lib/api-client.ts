import { supabase } from './supabase/client';
import type {
  User,
  Career,
  CareerDetail,
  Skill,
  LearnerSkill,
  Resource,
  Recommendation,
  AssessmentDetail,
  AssessmentResult,
  LearningPath,
  MilestoneItem,
  HeatmapDay,
  LeaderboardUser,
  ConversationSummary,
  ChatMessage,
  AIChatResponse,
  NextBestAction,
  RecommendationFeedbackPayload,
  RecommendationObservability,
  RecommendationEvaluationReport,
  SkillDetail,
  SkillPrerequisiteNode,
  PrerequisiteGraphResponse,
  IntelligentSkillGap,
  NextBestSkill,
  CareerReadinessSummary,
  GraphValidationReport,
  LearnerAdaptiveState,
  AdaptationEvent,
  ProgressHistoryPoint,
  RoadmapVersion,
  FeedbackInterpretationResult,
  AdaptiveBenchmarkReport,
} from '../types';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private async getAuthHeader(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        // Fallback to local token if stored during mock/guest testing
        const devToken = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_token') : null;
        if (devToken) {
          headers['Authorization'] = `Bearer ${devToken}`;
        }
      }
    } catch (e) {
      // Fallback
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeader();
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorBody.detail || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ---------------------------------------------------------------------------
  // Auth & Profile
  // ---------------------------------------------------------------------------
  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async syncUser(payload: { display_name?: string; avatar_url?: string }): Promise<User> {
    return this.request<User>('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateProfile(payload: Record<string, any>): Promise<any> {
    return this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async setTargetCareer(careerSlug: string): Promise<any> {
    return this.request('/profile/career', {
      method: 'POST',
      body: JSON.stringify({ career_slug: careerSlug }),
    });
  }

  // ---------------------------------------------------------------------------
  // Careers
  // ---------------------------------------------------------------------------
  async getCareers(category?: string): Promise<Career[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<Career[]>(`/careers${query}`);
  }

  async getCareer(slug: string): Promise<CareerDetail> {
    return this.request<CareerDetail>(`/careers/${slug}`);
  }

  // ---------------------------------------------------------------------------
  // Skills Taxonomy, Graph & Intelligent Gap Engine (Phase 7)
  // ---------------------------------------------------------------------------
  async getAllSkills(domain?: string, category?: string): Promise<Skill[]> {
    const params = new URLSearchParams();
    if (domain) params.append('domain', domain);
    if (category) params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Skill[]>(`/skills${qs}`);
  }

  async getMySkills(): Promise<LearnerSkill[]> {
    return this.request<LearnerSkill[]>('/skills/my-skills');
  }

  async getMySkillGaps(careerSlug?: string): Promise<CareerReadinessSummary> {
    const query = careerSlug ? `?career_slug=${encodeURIComponent(careerSlug)}` : '';
    return this.request<CareerReadinessSummary>(`/skills/skill-gaps${query}`);
  }

  async getNextBestSkill(): Promise<NextBestSkill | null> {
    return this.request<NextBestSkill | null>('/skills/next-best-skill');
  }

  async getSkillDetail(slugOrId: string): Promise<SkillDetail> {
    return this.request<SkillDetail>(`/skills/${encodeURIComponent(slugOrId)}`);
  }

  async getSkillPrerequisitesGraph(slugOrId: string): Promise<PrerequisiteGraphResponse> {
    return this.request<PrerequisiteGraphResponse>(`/skills/${encodeURIComponent(slugOrId)}/prerequisites`);
  }

  async validateSkillGraph(): Promise<GraphValidationReport> {
    return this.request<GraphValidationReport>('/skills/graph/validate');
  }

  async getSkillGapBenchmark(): Promise<any> {
    return this.request<any>('/skills/benchmark');
  }


  // ---------------------------------------------------------------------------
  // Resources & Recommendations
  // ---------------------------------------------------------------------------
  async getResources(resourceType?: string): Promise<Resource[]> {
    const query = resourceType ? `?resource_type=${encodeURIComponent(resourceType)}` : '';
    return this.request<Resource[]>(`/resources${query}`);
  }

  async getRecommendations(limit: number = 10, resourceType?: string, difficulty?: string): Promise<Recommendation[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (resourceType && resourceType !== 'All') params.append('resource_type', resourceType);
    if (difficulty && difficulty !== 'All') params.append('difficulty', difficulty);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Recommendation[]>(`/recommendations${qs}`);
  }

  async getNextBestAction(): Promise<NextBestAction> {
    return this.request<NextBestAction>('/recommendations/next-best-action');
  }

  async sendRecommendationFeedback(payload: RecommendationFeedbackPayload): Promise<any> {
    return this.request('/recommendations/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getRecommendationObservability(): Promise<RecommendationObservability> {
    return this.request<RecommendationObservability>('/recommendations/observability');
  }

  async getRecommendationEvaluation(k: number = 5): Promise<RecommendationEvaluationReport> {
    return this.request<RecommendationEvaluationReport>(`/recommendations/evaluate?k=${k}`);
  }

  // ---------------------------------------------------------------------------
  // Assessments
  // ---------------------------------------------------------------------------
  async getAssessment(careerSlug: string): Promise<AssessmentDetail> {
    return this.request<AssessmentDetail>(`/assessments/${careerSlug}`);
  }

  async submitAssessment(
    careerSlug: string,
    answers: Array<{ question_id: string; selected_option: number }>
  ): Promise<AssessmentResult> {
    return this.request<AssessmentResult>('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify({
        career_slug: careerSlug,
        answers,
      }),
    });
  }

  // ---------------------------------------------------------------------------
  // Roadmaps
  // ---------------------------------------------------------------------------
  async getRoadmap(): Promise<LearningPath> {
    return this.request<LearningPath>('/roadmaps/current');
  }

  async completeMilestone(milestoneId: string): Promise<MilestoneItem> {
    return this.request<MilestoneItem>(`/roadmaps/milestones/${milestoneId}/complete`, {
      method: 'POST',
    });
  }

  // ---------------------------------------------------------------------------
  // Progress & Activity
  // ---------------------------------------------------------------------------
  async logProgress(resourceId: string, minutes: number, status: string = 'completed'): Promise<any> {
    return this.request('/progress/log', {
      method: 'POST',
      body: JSON.stringify({
        resource_id: resourceId,
        time_spent_minutes: minutes,
        status,
      }),
    });
  }

  async getHeatmap(days: number = 28): Promise<HeatmapDay[]> {
    return this.request<HeatmapDay[]>(`/progress/heatmap?days=${days}`);
  }

  // ---------------------------------------------------------------------------
  // Feedback & Pacing Adaptation
  // ---------------------------------------------------------------------------
  async submitFeedback(payload: {
    feedback_type: string;
    learning_path_item_id?: string;
    notes?: string;
  }): Promise<any> {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ---------------------------------------------------------------------------
  // Analytics & Leaderboard
  // ---------------------------------------------------------------------------
  async getLeaderboard(): Promise<LeaderboardUser[]> {
    return this.request<LeaderboardUser[]>('/analytics/leaderboard');
  }

  // ---------------------------------------------------------------------------
  // AI Assistant & Tutoring
  // ---------------------------------------------------------------------------
  async getAIConversations(): Promise<ConversationSummary[]> {
    return this.request<ConversationSummary[]>('/ai/conversations');
  }

  async getAIConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/ai/conversations/${conversationId}/messages`);
  }

  async createAIConversation(title: string = 'AI Tutoring Session'): Promise<any> {
    return this.request('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async deleteAIConversation(conversationId: string): Promise<any> {
    return this.request(`/ai/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  async chatAISync(payload: {
    message: string;
    conversation_id?: string;
    active_skill?: string;
  }): Promise<AIChatResponse> {
    return this.request<AIChatResponse>('/ai/chat/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ---------------------------------------------------------------------------
  // Phase 8: Adaptive Learning Engine
  // ---------------------------------------------------------------------------
  async getAdaptiveState(): Promise<LearnerAdaptiveState> {
    return this.request<LearnerAdaptiveState>('/learners/me/state');
  }

  async getAdaptationTimeline(limit: number = 25): Promise<AdaptationEvent[]> {
    return this.request<AdaptationEvent[]>(`/learners/me/adaptation/timeline?limit=${limit}`);
  }

  async getProgressHistory(): Promise<ProgressHistoryPoint[]> {
    return this.request<ProgressHistoryPoint[]>('/learners/me/progress-history');
  }

  async getRoadmapVersions(): Promise<RoadmapVersion[]> {
    return this.request<RoadmapVersion[]>('/learners/me/roadmap/versions');
  }

  async submitEvidence(payload: {
    skill_id: string;
    evidence_type: string;
    score: number;
    raw_score?: number;
    source_id?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    return this.request('/learners/me/evidence', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async interpretFeedback(comment: string): Promise<FeedbackInterpretationResult> {
    return this.request<FeedbackInterpretationResult>('/learners/me/feedback/interpret', {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async getAdaptiveBenchmark(): Promise<AdaptiveBenchmarkReport> {
    return this.request<AdaptiveBenchmarkReport>('/learners/me/adaptation/benchmark');
  }
}

export const apiClient = new ApiClient();
