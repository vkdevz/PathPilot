import React from 'react';
import { Flame, Calendar as CalendarIcon, Clock } from 'lucide-react';

export const LearningHeatmap: React.FC = () => {
  // Generate 28 days for past month simulation
  const days = Array.from({ length: 28 }, (_, i) => {
    const intensity = (i % 7 === 0 || i % 5 === 0) ? 3 : (i % 3 === 0) ? 2 : (i % 2 === 0) ? 1 : 0;
    const minutes = intensity * 25;
    return {
      day: i + 1,
      intensity,
      minutes,
      date: `Aug ${i + 1}, 2026`
    };
  });

  const getBgClass = (intensity: number) => {
    switch (intensity) {
      case 3: return 'bg-emerald-500 text-white shadow-glow-emerald';
      case 2: return 'bg-brand-600 text-white';
      case 1: return 'bg-brand-100 text-brand-900 border border-brand-200';
      default: return 'bg-slate-100 border border-slate-200 text-slate-400';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-black text-slate-900">Learning Activity Heatmap</h3>
        </div>
        <div className="flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-extrabold">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>7 Day Streak Active</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-7 gap-2 pt-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-500 mb-1">
            {day}
          </div>
        ))}

        {days.map((item) => (
          <div
            key={item.day}
            className="group relative flex flex-col items-center justify-center h-10 rounded-xl transition-all hover:scale-105 cursor-pointer"
          >
            <div className={`w-full h-full rounded-xl transition-colors ${getBgClass(item.intensity)} flex items-center justify-center text-xs font-black`}>
              {item.day}
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-12 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-2xl z-30 whitespace-nowrap pointer-events-none">
              <span className="font-bold text-amber-300">{item.date}</span>
              <span className="text-slate-200">{item.minutes > 0 ? `${item.minutes} mins learned` : 'Rest Day'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-semibold">
        <span className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Total Monthly Time: <strong className="text-slate-900">14.5 Hours</strong></span>
        </span>
        <div className="flex items-center space-x-1.5">
          <span>Less</span>
          <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
          <div className="w-3 h-3 rounded bg-brand-100 border border-brand-200" />
          <div className="w-3 h-3 rounded bg-brand-600" />
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
