import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LearningHeatmap } from '../components/LearningHeatmap';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { selectedCareer } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-100 text-brand-800 border border-brand-200">
          Heroic Analytics
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
          Learning Progress & Contribution Heatmap
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Tracking your skill evolution over time for <strong className="text-brand-600">{selectedCareer?.name || 'Data Scientist'}</strong>.
        </p>
      </div>

      {/* Heatmap Calendar */}
      <LearningHeatmap />

      {/* Skill Growth Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm bg-white">
          <div className="flex items-center space-x-2 text-brand-600 font-black">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-slate-900 text-base">Skill Growth Trajectory</h3>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { name: 'Machine Learning', start: 40, mid: 52, current: 67, color: 'bg-emerald-500' },
              { name: 'Statistics & Probability', start: 25, mid: 32, current: 48, color: 'bg-brand-600' },
              { name: 'SQL & Relational DBs', start: 50, mid: 62, current: 75, color: 'bg-sky-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-900">{item.name}</span>
                  <span className="text-emerald-600 font-black">{item.start}% → {item.current}% (+{item.current - item.start}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className={`h-full ${item.color} transition-all duration-700`} style={{ width: `${item.current}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment History */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm bg-white">
          <div className="flex items-center space-x-2 text-emerald-600 font-black">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-slate-900 text-base">Assessment History</h3>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { date: 'Aug 22, 2026', title: 'Data Science Knowledge Quest', score: 62.5, status: 'Completed' },
              { date: 'Aug 15, 2026', title: 'Python Baseline Quiz', score: 85.0, status: 'Completed' },
              { date: 'Aug 08, 2026', title: 'Initial Career Assessment', score: 45.0, status: 'Completed' },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                <div>
                  <span className="font-extrabold text-slate-900 block">{item.title}</span>
                  <span className="text-[11px] text-slate-500">{item.date}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 text-sm block">{item.score}%</span>
                  <span className="text-[10px] text-slate-500">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
