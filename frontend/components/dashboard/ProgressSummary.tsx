import React from 'react';
import { Trophy, Flame, Clock } from 'lucide-react';

interface ProgressSummaryProps {
  progressPct: number;
  completedMilestones: number;
  totalMilestones: number;
  xp: number;
  streakDays: number;
  estimatedHoursLeft?: number;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  progressPct,
  completedMilestones,
  totalMilestones,
  xp,
  streakDays,
  estimatedHoursLeft = 14,
}) => {
  return (
    <div className="surface-card rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
          Roadmap Progress
        </h3>
        <span className="text-xs font-bold text-indigo-400">{progressPct}%</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/[0.06]">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${Math.max(progressPct, 4)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>{completedMilestones} / {totalMilestones} Milestones</span>
          <span>{totalMilestones - completedMilestones} remaining</span>
        </div>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06] text-center">
          <div className="text-xs font-bold text-amber-300">{xp}</div>
          <span className="text-[10px] text-slate-500 font-medium">XP</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06] text-center">
          <div className="text-xs font-bold text-rose-300">{streakDays}d</div>
          <span className="text-[10px] text-slate-500 font-medium">Streak</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06] text-center">
          <div className="text-xs font-bold text-slate-300">~{estimatedHoursLeft}h</div>
          <span className="text-[10px] text-slate-500 font-medium">Est. Left</span>
        </div>
      </div>
    </div>
  );
};
