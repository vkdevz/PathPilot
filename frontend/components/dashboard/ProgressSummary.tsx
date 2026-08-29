import React from 'react';
import { Trophy, CheckCircle2, Flame, Clock, Layers } from 'lucide-react';

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
    <div className="glass-panel rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-indigo-400" />
          <span>Learner Progress</span>
        </h3>
        <span className="text-sm font-extrabold text-indigo-300">{progressPct}% Complete</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-brand-500 to-cyan-400 transition-all duration-700 shadow-glow-indigo"
            style={{ width: `${Math.max(progressPct, 4)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
          <span>{completedMilestones} of {totalMilestones} Milestones</span>
          <span>{totalMilestones - completedMilestones} Remaining</span>
        </div>
      </div>

      {/* 3 Metric Mini Cards */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{xp}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Total XP</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-1 text-rose-400 mb-1">
            <Flame className="w-3.5 h-3.5 fill-rose-400" />
            <span className="text-xs font-bold">{streakDays}d</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Streak</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">~{estimatedHoursLeft}h</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Est. Left</span>
        </div>
      </div>
    </div>
  );
};
