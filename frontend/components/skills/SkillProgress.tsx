import React from 'react';
import { Badge } from '../ui/Badge';
import type { LearnerSkill } from '../../types';

interface SkillProgressProps {
  skill: LearnerSkill;
  targetScore?: number;
}

export const SkillProgress: React.FC<SkillProgressProps> = ({
  skill,
  targetScore = 85,
}) => {
  const currentScore = Math.round(skill.score || 0);
  const isMastered = currentScore >= 85;
  const isProficient = currentScore >= 70 && currentScore < 85;

  const getStatusBadge = () => {
    if (isMastered) return <Badge variant="success">Mastered</Badge>;
    if (isProficient) return <Badge variant="primary">Proficient</Badge>;
    return <Badge variant="warning">Needs Focus</Badge>;
  };

  const getBarColor = () => {
    if (isMastered) return 'bg-[#34C759]';
    if (isProficient) return 'bg-[#007AFF]';
    return 'bg-[#FF9F0A]';
  };

  return (
    <div className="surface-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">
            {skill.category}
          </span>
          <h4 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">{skill.skill_name}</h4>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{currentScore}%</span>
        </div>
      </div>

      {/* Progress Bar with Target Marker */}
      <div className="relative pt-1">
        <div className="w-full h-2 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] overflow-hidden">
          <div
            className={`h-full rounded-full ${getBarColor()} transition-all duration-500`}
            style={{ width: `${Math.min(currentScore, 100)}%` }}
          />
        </div>

        {/* Target Proficiency Marker */}
        <div
          title={`Target Industry Benchmark: ${targetScore}%`}
          className="absolute top-0 w-0.5 h-3.5 bg-[#86868B] -translate-x-1/2 pointer-events-none"
          style={{ left: `${targetScore}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] pt-0.5">
        <span>Current: {currentScore}%</span>
        <span>Target: {targetScore}%</span>
      </div>
    </div>
  );
};
