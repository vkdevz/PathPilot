import { supabase } from './supabase/client';
import type {
  User,
  Career,
  CareerDetail,
  AssessmentDetail,
  AssessmentResult,
  LearningPath,
  MilestoneItem,
  LearnerSkill,
  HeatmapDay,
  LeaderboardUser,
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
        // Fallback to local token if stored during mock/dev testing
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

  // Auth & Profile
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

  // Careers
  async getCareers(category?: string): Promise<Career[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<Career[]>(`/careers${query}`);
  }

  async getCareer(slug: string): Promise<CareerDetail> {
    return this.request<CareerDetail>(`/careers/${slug}`);
  }

  // Skills
  async getMySkills(): Promise<LearnerSkill[]> {
    return this.request<LearnerSkill[]>('/skills/my-skills');
  }

  // Assessments
  async getAssessment(careerSlug: string): Promise<AssessmentDetail> {
    return this.request<AssessmentDetail>(`/assessments/${careerSlug}`);
  }

  async submitAssessment(careerSlug: string, answers: Array<{ question_id: string; selected_option: number }>): Promise<AssessmentResult> {
    return this.request<AssessmentResult>('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify({
        career_slug: careerSlug,
        answers,
      }),
    });
  }

  // Roadmaps
  async getRoadmap(): Promise<LearningPath> {
    return this.request<LearningPath>('/roadmaps/current');
  }

  async completeMilestone(milestoneId: string): Promise<MilestoneItem> {
    return this.request<MilestoneItem>(`/roadmaps/milestones/${milestoneId}/complete`, {
      method: 'POST',
    });
  }

  // Progress & Activity
  async logProgress(resourceId: string, minutes: number): Promise<any> {
    return this.request('/progress/log', {
      method: 'POST',
      body: JSON.stringify({
        resource_id: resourceId,
        time_spent_minutes: minutes,
        status: 'completed',
      }),
    });
  }

  async getHeatmap(days: number = 28): Promise<HeatmapDay[]> {
    return this.request<HeatmapDay[]>(`/progress/heatmap?days=${days}`);
  }

  // Feedback & Pacing Adaptation
  async submitFeedback(payload: { feedback_type: string; learning_path_item_id?: string; notes?: string }): Promise<any> {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Analytics & Leaderboard
  async getLeaderboard(): Promise<LeaderboardUser[]> {
    return this.request<LeaderboardUser[]>('/analytics/leaderboard');
  }
}

export const apiClient = new ApiClient();
