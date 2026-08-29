import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RadarChart } from '../components/RadarChart';
import { 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Target
} from 'lucide-react';

export const SkillReportPage: React.FC = () => {
  const { assessmentReport, selectedCareer, setActiveView } = useAuth();

  if (!assessmentReport) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>No assessment report found yet. Complete a knowledge quest first.</p>
        <button
          onClick={() => setActiveView('assessment')}
          className="mt-4 px-6 py-2 rounded-2xl bg-brand-600 text-white font-extrabold text-xs"
        >
          Start Knowledge Quest
        </button>
      </div>
    );
  }

  const { overall_score, topic_scores, strong_topics, moderate_topics, weak_topics, recommendations } = assessmentReport;

  // Prepare data for Radar Chart
  const radarData = topic_scores.map(t => ({
    name: t.skill_name.length > 14 ? t.skill_name.substring(0, 12) + '...' : t.skill_name,
    score: t.score
  }));

  const recommendedStartingPoint = recommendations.length > 0 ? recommendations[0].skill_name : 'Statistics & Probability';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      
      {/* Report Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
          Stage 3 — Skill Profile Revealed
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Your Skill Power Has Been Revealed
        </h1>
        <p className="text-slate-600 text-base">
          Target Goal: <strong className="text-brand-600">{selectedCareer?.name || 'Data Scientist'}</strong>
        </p>
      </div>

      {/* Main Score & Radar Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Overall Readiness Gauge */}
        <div className="lg:col-span-5 glass-panel p-8 rounded-3xl border border-slate-200 flex flex-col justify-between items-center text-center shadow-soft-lg">
          <div className="w-full">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-4">
              Overall Career Readiness
            </span>
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  stroke="#E2E8F0"
                  strokeWidth="14"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  stroke="url(#scoreGradientLight)"
                  strokeWidth="14"
                  strokeDasharray="465"
                  strokeDashoffset={465 - (465 * overall_score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{overall_score}%</span>
                <span className="text-[11px] text-slate-500 font-extrabold">Readiness Unlocked</span>
              </div>
            </div>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-bold">
              <span>Strong Skills (80%+):</span>
              <span className="font-black text-emerald-600">{strong_topics.length}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 font-bold">
              <span>Developing (50-79%):</span>
              <span className="font-black text-amber-600">{moderate_topics.length}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 font-bold">
              <span>Skill Gaps (&lt;50%):</span>
              <span className="font-black text-rose-600">{weak_topics.length}</span>
            </div>
          </div>
        </div>

        {/* Right: Radar Chart Visualization */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center shadow-soft-lg">
          <h3 className="text-base font-black text-slate-900 mb-2">Competency Radar Map</h3>
          <RadarChart data={radarData} size={300} />
        </div>

      </div>

      {/* Detailed Skill Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Strong Areas */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-200 space-y-3 bg-emerald-50/40">
          <div className="flex items-center space-x-2 text-emerald-700 font-black text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>🟢 Your Strengths (80-100%)</span>
          </div>
          {strong_topics.length === 0 ? (
            <p className="text-xs text-slate-500">None identified yet.</p>
          ) : (
            <div className="space-y-2">
              {strong_topics.map(t => (
                <div key={t.skill_id} className="p-3 rounded-2xl bg-white border border-emerald-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{t.name}</span>
                  <span className="text-emerald-600 font-black">{t.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Developing Areas */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-200 space-y-3 bg-amber-50/40">
          <div className="flex items-center space-x-2 text-amber-700 font-black text-sm">
            <TrendingUp className="w-5 h-5" />
            <span>🟡 Developing (50-79%)</span>
          </div>
          {moderate_topics.length === 0 ? (
            <p className="text-xs text-slate-500">None identified yet.</p>
          ) : (
            <div className="space-y-2">
              {moderate_topics.map(t => (
                <div key={t.skill_id} className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{t.name}</span>
                  <span className="text-amber-600 font-black">{t.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skill Gaps */}
        <div className="glass-panel p-6 rounded-3xl border border-rose-200 space-y-3 bg-rose-50/40">
          <div className="flex items-center space-x-2 text-rose-700 font-black text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>🔴 Skill Gaps (0-49%)</span>
          </div>
          {weak_topics.length === 0 ? (
            <p className="text-xs text-slate-500">No skill gaps found!</p>
          ) : (
            <div className="space-y-2">
              {weak_topics.map(t => (
                <div key={t.skill_id} className="p-3 rounded-2xl bg-white border border-rose-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{t.name}</span>
                  <span className="text-rose-600 font-black">{t.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recommended Starting Point & CTA */}
      <div className="glass-panel p-8 rounded-3xl border border-brand-300 shadow-glow-celestial flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-white via-purple-50 to-sky-50">
        <div>
          <span className="text-xs font-black text-brand-700 uppercase tracking-widest flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>AI Personalization Engine</span>
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">Recommended Starting Quest</h3>
          <p className="text-slate-600 text-sm mt-1">
            Based on prerequisite graphs and weak area prioritization, we recommend starting with: <strong className="text-brand-600">{recommendedStartingPoint}</strong>
          </p>
        </div>

        <button
          onClick={() => setActiveView('dashboard')}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-105 text-white font-black text-base shadow-glow-celestial transition-all flex items-center space-x-2 shrink-0"
        >
          <span>Build My Personalized Path</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
