'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Zap, Layers } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { IntelligentSkillGap } from '../../types';

interface SkillGapCardProps {
  gap?: IntelligentSkillGap;
  skillName?: string;
  category?: string;
  currentScore?: number;
  targetScore?: number;
  gapDelta?: number;
  priority?: 'High' | 'Medium' | 'Low';
  onInspectSkill?: (skillSlug: string) => void;
}

export const SkillGapCard: React.FC<SkillGapCardProps> = ({
  gap,
  skillName: propSkillName,
  category: propCategory,
  currentScore: propCurrentScore,
  targetScore: propTargetScore,
  gapDelta: propGapDelta,
  priority: propPriority = 'High',
  onInspectSkill,
}) => {
  const name = gap ? gap.skill_name : (propSkillName || 'Skill');
  const cat = gap ? (gap.domain || gap.category) : (propCategory || 'Engineering');
  const cur = gap ? gap.current_score : (propCurrentScore || 0);
  const tgt = gap ? gap.target_score : (propTargetScore || 85);
  const delta = gap ? Math.round(gap.raw_gap * 100) : (propGapDelta || Math.max(0, tgt - cur));
  const isBottleneck = gap ? gap.is_bottleneck : false;
  const readiness = gap ? gap.readiness_state : 'READY_TO_START';
  const downstreamCount = gap ? gap.downstream_skills_count : 0;
  const unsatisfied = gap ? gap.unsatisfied_prerequisites : [];
  const slug = gap ? gap.skill_slug : '';

  let readinessBadgeVariant: 'primary' | 'success' | 'warning' | 'danger' | 'slate' = 'primary';
  let readinessLabel = 'Ready to Start';
  if (readiness === 'TARGET_REACHED') {
    readinessBadgeVariant = 'success';
    readinessLabel = 'Mastered';
  } else if (readiness === 'FOUNDATION_REQUIRED' || readiness === 'NOT_READY') {
    readinessBadgeVariant = 'danger';
    readinessLabel = 'Prereq Required';
  } else if (readiness === 'NEAR_TARGET') {
    readinessBadgeVariant = 'primary';
    readinessLabel = 'Near Target';
  } else if (readiness === 'DEVELOPING') {
    readinessBadgeVariant = 'warning';
    readinessLabel = 'Developing';
  }

  return (
    <div className={`surface-card rounded-xl p-4 flex flex-col justify-between space-y-3.5 ${isBottleneck ? 'border-l-4 border-l-[#FF3B30]' : ''}`}>
      <div className="space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider truncate">
            {cat}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isBottleneck && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-[#FFF0EF] dark:bg-[#FF453A]/15 text-[#FF3B30] border border-[#FF3B30]/20">
                Bottleneck
              </span>
            )}
            <Badge variant={readinessBadgeVariant} size="sm">
              {readinessLabel}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <div>
          <h4 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">{name}</h4>
          {gap && gap.explanation && (
            <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-1 line-clamp-2 leading-relaxed">
              {gap.explanation}
            </p>
          )}
        </div>

        {/* Progression: Current -> Target -> Gap */}
        <div className="p-2.5 rounded-lg bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6E6E73] dark:text-[#AEAEB2]">
              Current: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">{cur}%</strong>
            </span>
            <span className="text-[#6E6E73] dark:text-[#AEAEB2]">
              Target: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">{tgt}%</strong>
            </span>
            <span className="text-[#FF3B30] font-semibold text-[11px]">
              -{delta}% Gap
            </span>
          </div>

          <div className="w-full bg-[#E5E5EA] dark:bg-[#38383A] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${isBottleneck ? 'bg-[#FF3B30]' : cur >= 75 ? 'bg-[#34C759]' : 'bg-[#007AFF]'}`}
              style={{ width: `${Math.min(100, Math.max(4, cur))}%` }}
            />
          </div>
        </div>

        {/* Unsatisfied Prereqs */}
        {unsatisfied.length > 0 && (
          <div className="flex items-start gap-1.5 text-[11px] text-[#FF9F0A] bg-[#FFF4E0] dark:bg-[#FF9F0A]/15 border border-[#FF9F0A]/20 rounded p-1.5">
            <Lock className="w-3 h-3 text-[#FF9F0A] shrink-0 mt-0.5" />
            <span>Requires: {unsatisfied.join(', ')}</span>
          </div>
        )}

        {/* Downstream unlock indicator */}
        {downstreamCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#007AFF] font-medium">
            <Zap className="w-3 h-3 text-[#007AFF]" />
            <span>Unlocks {downstreamCount} downstream competencies</span>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#E5E5EA] dark:border-[#38383A]">
        {onInspectSkill && slug && (
          <button
            onClick={() => onInspectSkill(slug)}
            className="p-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] border border-[#D2D2D7] dark:border-[#38383A] transition-colors cursor-pointer"
            title="Inspect Prerequisite Node"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        )}

        <Link
          href="/recommendations"
          className="inline-flex items-center justify-between flex-1 py-1.5 px-3 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium border border-[#D2D2D7] dark:border-[#38383A] transition-colors"
        >
          <span>Bridge Gap</span>
          <ArrowRight className="w-3 h-3 text-[#007AFF]" />
        </Link>
      </div>
    </div>
  );
};
