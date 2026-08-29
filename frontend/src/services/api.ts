import { Career, Question, AssessmentReport, Recommendation, LeaderboardUser } from '../types';
import { MarketIntelligenceEngine, PROTOTYPE_MARKET_ROLES } from './marketIntelligence';

const API_BASE = 'http://localhost:8000/api';

export async function fetchCareers(): Promise<Career[]> {
  try {
    const res = await fetch(`${API_BASE}/careers`);
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend API unavailable, using Market Intelligence Engine dataset:', err);
    return PROTOTYPE_MARKET_ROLES.map(role => MarketIntelligenceEngine.getCareerObject(role.roleId));
  }
}

export async function fetchAssessmentQuestions(careerId: string): Promise<Question[]> {
  try {
    const res = await fetch(`${API_BASE}/assessment/${careerId}/questions`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return await res.json();
  } catch (err) {
    console.warn('Using Market Intelligence Engine assessment questions:', err);
    return MarketIntelligenceEngine.generateAssessmentQuestions(careerId);
  }
}

export async function submitAssessment(
  arg1: string,
  arg2: any,
  arg3?: any
): Promise<AssessmentReport> {
  let careerId = arg1;
  let answersMap: Record<string, number> = {};

  if (typeof arg2 === 'string') {
    // Called as submitAssessment(userId, careerId, payload)
    careerId = arg2;
    if (Array.isArray(arg3)) {
      arg3.forEach((item: any) => {
        answersMap[item.question_id] = item.selected_option;
      });
    } else if (arg3 && typeof arg3 === 'object') {
      answersMap = arg3;
    }
  } else if (typeof arg2 === 'object') {
    // Called as submitAssessment(careerId, answersMap)
    answersMap = arg2;
  }

  try {
    const res = await fetch(`${API_BASE}/assessment/${careerId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answersMap })
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, generating local AssessmentReport:', err);
    
    const role = MarketIntelligenceEngine.getCareerObject(careerId);
    const questions = MarketIntelligenceEngine.generateAssessmentQuestions(careerId);

    const skillScoresMap: Record<string, { correct: number; total: number; name: string }> = {};

    questions.forEach(q => {
      if (!skillScoresMap[q.skill_id]) {
        skillScoresMap[q.skill_id] = { correct: 0, total: 0, name: q.skill_name };
      }
      skillScoresMap[q.skill_id].total += 1;
      if (answersMap[q.id] === q.correct_answer) {
        skillScoresMap[q.skill_id].correct += 1;
      }
    });

    const topic_scores = Object.entries(skillScoresMap).map(([skill_id, data]) => {
      const score = Math.round((data.correct / data.total) * 100);
      let strength_level: 'Strong' | 'Moderate' | 'Weak' = 'Weak';
      if (score >= 80) strength_level = 'Strong';
      else if (score >= 50) strength_level = 'Moderate';

      return {
        skill_id,
        skill_name: data.name,
        score,
        strength_level,
        correct_count: data.correct,
        total_count: data.total
      };
    });

    const overall_score = topic_scores.length > 0 
      ? Math.round(topic_scores.reduce((acc, t) => acc + t.score, 0) / topic_scores.length)
      : 0;

    const strong_topics = topic_scores.filter(t => t.score >= 80).map(t => ({ skill_id: t.skill_id, name: t.skill_name, score: t.score }));
    const moderate_topics = topic_scores.filter(t => t.score >= 50 && t.score < 80).map(t => ({ skill_id: t.skill_id, name: t.skill_name, score: t.score }));
    const weak_topics = topic_scores.filter(t => t.score < 50).map(t => ({ skill_id: t.skill_id, name: t.skill_name, score: t.score }));

    const recommendations: Recommendation[] = topic_scores
      .filter(t => t.score < 80)
      .sort((a, b) => a.score - b.score)
      .map((t) => ({
        skill_id: t.skill_id,
        skill_name: t.skill_name,
        category: role.skills.find(s => s.id === t.skill_id)?.category || 'Core Skills',
        priority: t.score < 50 ? 'High' : 'Medium',
        reason: `Skill assessment score is ${t.score}%. Strengthening ${t.skill_name} is required for industry readiness.`,
        action: `Complete ${t.skill_name} quest & practice exercises.`,
        estimated_minutes: role.skills.find(s => s.id === t.skill_id)?.estimated_minutes || 90,
        current_score: t.score
      }));

    return {
      assessment_id: 'report_' + Date.now(),
      overall_score,
      topic_scores,
      strong_topics,
      moderate_topics,
      weak_topics,
      recommendations
    };
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardUser[]> {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return await res.json();
  } catch (err) {
    return [
      { rank: 1, name: 'Aria Thorne', xp: 4850, streak: 14, badges: 9, career: 'Data Scientist', is_current: false },
      { rank: 2, name: 'Kaelen Voss', xp: 4120, streak: 11, badges: 7, career: 'AI Engineer', is_current: false },
      { rank: 3, name: 'Alex Rivera (You)', xp: 3250, streak: 7, badges: 5, career: 'Data Scientist', is_current: true },
      { rank: 4, name: 'Elena Rostova', xp: 2980, streak: 5, badges: 4, career: 'Full Stack Developer', is_current: false },
      { rank: 5, name: 'Tariq Al-Mansoor', xp: 2640, streak: 4, badges: 3, career: 'Cloud Engineer', is_current: false }
    ];
  }
}

export async function sendChatMessage(message: string, context?: any): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });
    if (!res.ok) throw new Error('Chatbot failed');
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.warn('Backend Chatbot offline, utilizing local AI assistant logic:', err);

    const careerName = context?.career_name || context?.careerName || 'your target career';
    const currentStep = context?.currentStep || 'Python Fundamentals';
    const weakSkills = context?.weak_topics ? context.weak_topics.map((w: any) => w.name || w) : [];

    if (message.toLowerCase().includes('unlock') || message.toLowerCase().includes('locked')) {
      return `Mastering ${careerName} requires completing prerequisites in order! If a step is locked, complete the active highlighted quest on your staircase first (${currentStep}).`;
    }
    if (message.toLowerCase().includes('next') || message.toLowerCase().includes('recommend')) {
      return `Based on your assessment, your priority quest is **${currentStep}**. Focusing on your skill gaps (${weakSkills.slice(0, 2).join(', ') || 'foundation skills'}) will boost your Career Readiness score!`;
    }
    return `Hello traveler! I am **PathPilot AI**. I'm tracking your journey toward **${careerName}**. You are currently focusing on **${currentStep}**. How can I assist your learning quest today?`;
  }
}

export async function askChatbot(userId: string, message: string, context?: any): Promise<string> {
  return sendChatMessage(message, context);
}
