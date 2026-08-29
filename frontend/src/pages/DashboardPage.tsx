import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StaircaseMap } from '../components/StaircaseMap';
import { FeedbackModal } from '../components/FeedbackModal';
import { 
  Flame, 
  Trophy, 
  Target, 
  Sparkles, 
  Clock, 
  Play, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Swords,
  ShieldCheck
} from 'lucide-react';
import { Skill, Recommendation } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, selectedCareer, assessmentReport, addXP, setActiveView } = useAuth();
  const [feedbackSkill, setFeedbackSkill] = useState<string | null>(null);

  const skills = selectedCareer?.skills || [
    { id: 'python_ds', name: 'Python for Data Science', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Master core syntax and data structures.', estimated_minutes: 120 },
    { id: 'sql_ds', name: 'SQL & Relational DBs', category: 'Foundation', difficulty: 'Beginner', level: 2, prerequisites: ['python_ds'], description: 'Querying and window functions.', estimated_minutes: 90 },
    { id: 'stats_ds', name: 'Statistics & Probability', category: 'Foundation', difficulty: 'Intermediate', level: 3, prerequisites: ['python_ds'], description: 'Descriptive stats and hypothesis testing.', estimated_minutes: 150 },
    { id: 'data_analysis', name: 'Pandas & Data Cleaning', category: 'Core Skills', difficulty: 'Intermediate', level: 4, prerequisites: ['python_ds', 'sql_ds'], description: 'Exploratory data analysis.', estimated_minutes: 110 },
    { id: 'ml_foundations', name: 'Machine Learning Fundamentals', category: 'Core Skills', difficulty: 'Intermediate', level: 5, prerequisites: ['stats_ds'], description: 'Regression, Trees, Random Forests.', estimated_minutes: 180 }
  ];

  // Map topic scores from report
  const topicScores: Record<string, number> = {};
  if (assessmentReport?.topic_scores) {
    assessmentReport.topic_scores.forEach(t => {
      topicScores[t.skill_id] = t.score;
    });
  } else {
    topicScores['python_ds'] = 85;
    topicScores['sql_ds'] = 60;
    topicScores['stats_ds'] = 38;
    topicScores['ml_foundations'] = 45;
  }

  // Recommendations
  const recommendations: Recommendation[] = assessmentReport?.recommendations || [
    {
      skill_id: 'stats_ds',
      skill_name: 'Statistics & Probability',
      category: 'Foundation',
      priority: 'High',
      reason: 'Recommended because your assessment score in Statistics & Probability is 38% (Skill Gap).',
      action: 'Start Quest',
      estimated_minutes: 90,
      current_score: 38
    },
    {
      skill_id: 'ml_foundations',
      skill_name: 'Machine Learning Fundamentals',
      category: 'Core Skills',
      priority: 'High',
      reason: 'Recommended because Machine Learning requires Statistics as a core prerequisite.',
      action: 'Start Quest',
      estimated_minutes: 120,
      current_score: 45
    }
  ];

  const [completedSkillIds, setCompletedSkillIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('pathpilot_completed_skills');
    return saved ? JSON.parse(saved) : ['ds_py', 'python_ds'];
  });

  const handleSelectSkill = (skill: Skill) => {
    addXP(50);
  };

  const handleCompleteSkill = (skillId: string) => {
    if (!completedSkillIds.includes(skillId)) {
      const updated = [...completedSkillIds, skillId];
      setCompletedSkillIds(updated);
      localStorage.setItem('pathpilot_completed_skills', JSON.stringify(updated));
      addXP(150);
    }
  };

  const handleFeedbackSubmit = (feedback: 'useful' | 'not_useful') => {
    setFeedbackSkill(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm bg-white">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Welcome back, {user?.name || 'Hero'} 👋
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Your journey toward becoming a <strong className="text-brand-600">{selectedCareer?.name || 'Data Scientist'}</strong> continues in Your Personal Learning World.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center space-x-2 text-xs sm:text-sm font-black">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-bounce" />
            <span>7 Day Streak</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center space-x-2 text-xs sm:text-sm font-black">
            <Trophy className="w-5 h-5 text-brand-600" />
            <span>{user?.xp || 2250} XP</span>
          </div>
        </div>
      </div>

      {/* Grid: Today's Quest & Skill Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Today's Quest ⚔️ Card */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-brand-300 shadow-glow-celestial relative space-y-4 bg-gradient-to-r from-white via-purple-50 to-sky-50">
          <div className="flex items-center justify-between">
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-brand-600 text-white shadow-sm flex items-center space-x-1">
              <Swords className="w-3.5 h-3.5" />
              <span>Today's Quest ⚔️</span>
            </span>
            <span className="text-xs text-slate-500 font-bold">Goal: 20 min/day</span>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">Probability Fundamentals — 20 min</h3>
            <p className="text-xs text-slate-600 mt-1">
              Master p-value calculations and probability distributions to unlock your next realm.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600">Daily Quest Progress</span>
              <span className="text-brand-600 font-black">12 / 20 min</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-400 w-[60%]" />
            </div>
          </div>

          <button
            onClick={() => addXP(100)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-[1.01] text-white font-black text-xs uppercase tracking-wider shadow-glow-celestial flex items-center justify-center space-x-2 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Continue Quest (+100 XP)</span>
          </button>
        </div>

        {/* Skill Overview Widget */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base">Skill Overview</h3>
            <button
              onClick={() => setActiveView('skill-report')}
              className="text-xs text-brand-600 font-extrabold hover:underline"
            >
              Full Report
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Python for Data Science', level: 'Strong (85%)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { name: 'SQL & Relational DBs', level: 'Moderate (60%)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { name: 'Statistics & Probability', level: 'Weak (38%)', color: 'text-rose-700 bg-rose-50 border-rose-200' },
              { name: 'Machine Learning', level: 'Weak (45%)', color: 'text-rose-700 bg-rose-50 border-rose-200' },
            ].map((s, idx) => (
              <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">{s.name}</span>
                <span className={`px-2 py-0.5 rounded-md font-black border ${s.color}`}>
                  {s.level}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hero Journey Staircase Progression Section */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 space-y-6 shadow-soft-lg bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-brand-600 uppercase tracking-widest">
              Hero Journey Roadmap
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Your Staircase Progression Path
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ascend through Foundation, Core, Advanced, and Industry Realms to reach your ultimate career goal.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="flex items-center space-x-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Mastered</span>
            </span>
            <span className="flex items-center space-x-1.5 text-brand-600">
              <span className="w-3 h-3 rounded-full bg-brand-600" />
              <span>Current Quest ✨</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-slate-300" />
              <span>Locked</span>
            </span>
          </div>
        </div>

        {/* Staircase Map Component */}
        <StaircaseMap
          skills={skills}
          topicScores={topicScores}
          recommendations={recommendations}
          completedSkillIds={completedSkillIds}
          onSelectSkill={handleSelectSkill}
          onCompleteSkill={handleCompleteSkill}
          targetRoleName={selectedCareer?.name || 'Data Scientist'}
        />
      </div>

      {/* Chosen For You ✨ AI Recommendations */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-black text-slate-900">Chosen For You ✨</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">Adaptive AI Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.skill_id}
              className="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-brand-100 text-brand-800 border border-brand-200 uppercase">
                    {rec.priority} Priority Quest
                  </span>
                  <span className="text-xs text-slate-500 font-bold">{rec.estimated_minutes} mins</span>
                </div>

                <h4 className="font-black text-slate-900 text-base">{rec.skill_name}</h4>
                
                {/* Explicit "WHY" Explanation */}
                <div className="mt-2.5 p-3 rounded-2xl bg-white border border-brand-200 text-xs text-slate-700 shadow-sm">
                  <strong className="text-brand-700 font-black">Why am I seeing this?</strong> {rec.reason}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => addXP(75)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-glow-celestial transition-all flex items-center space-x-1"
                >
                  <span>{rec.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold">
                  <span>Helpful?</span>
                  <button
                    onClick={() => setFeedbackSkill(rec.skill_name)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setFeedbackSkill(rec.skill_name)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackSkill && (
        <FeedbackModal
          skillName={feedbackSkill}
          onFeedbackSubmit={handleFeedbackSubmit}
          onClose={() => setFeedbackSkill(null)}
        />
      )}

    </div>
  );
};
