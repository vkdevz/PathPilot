import React from 'react';

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
    <div className="surface-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
          Roadmap Progress
        </h3>
        <span className="text-xs font-bold text-[#007AFF]">{progressPct}%</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#007AFF] transition-all duration-500"
            style={{ width: `${Math.max(progressPct, 4)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#6E6E73] dark:text-[#AEAEB2] font-medium">
          <span>{completedMilestones} / {totalMilestones} Milestones</span>
          <span>{totalMilestones - completedMilestones} remaining</span>
        </div>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="p-2.5 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-center">
          <div className="text-xs font-bold text-[#FF9F0A]">{xp}</div>
          <span className="text-[10px] text-[#86868B] font-medium">XP</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-center">
          <div className="text-xs font-bold text-[#34C759]">{streakDays}d</div>
          <span className="text-[10px] text-[#86868B] font-medium">Streak</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-center">
          <div className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">~{estimatedHoursLeft}h</div>
          <span className="text-[10px] text-[#86868B] font-medium">Est. Left</span>
        </div>
      </div>
    </div>
  );
};
