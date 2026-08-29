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
  const isDeveloping = currentScore < 70;

  const getStatusBadge = () => {
    if (isMastered) return <Badge variant="emerald">Mastered</Badge>;
    if (isProficient) return <Badge variant="indigo">Proficient</Badge>;
    return <Badge variant="amber">Needs Focus</Badge>;
  };

  const getBarColor = () => {
    if (isMastered) return 'from-emerald-500 to-cyan-400';
    if (isProficient) return 'from-indigo-500 to-brand-400';
    return 'from-amber-500 to-rose-400';
  };

  return (
    <div className="glass-panel rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {skill.category}
          </span>
          <h4 className="text-sm font-bold text-white mt-0.5">{skill.skill_name}</h4>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="text-sm font-extrabold text-white">{currentScore}%</span>
        </div>
      </div>

      {/* Progress Bar with Target Marker */}
      <div className="relative pt-1">
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getBarColor()} transition-all duration-500`}
            style={{ width: `${Math.min(currentScore, 100)}%` }}
          />
        </div>

        {/* Target Proficiency Marker */}
        <div
          title={`Target Industry Benchmark: ${targetScore}%`}
          className="absolute top-0 w-0.5 h-4 bg-slate-400/80 -translate-x-1/2 pointer-events-none"
          style={{ left: `${targetScore}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
        <span>Current: {currentScore}%</span>
        <span>Target: {targetScore}%</span>
      </div>
    </div>
  );
};
