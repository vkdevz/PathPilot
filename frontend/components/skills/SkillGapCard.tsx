'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Lock, Zap, Layers, AlertCircle } from 'lucide-react';
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
  const importance = gap ? gap.career_importance : 'high';
  const downstreamCount = gap ? gap.downstream_skills_count : 0;
  const unsatisfied = gap ? gap.unsatisfied_prerequisites : [];
  const slug = gap ? gap.skill_slug : '';

  let readinessBadgeVariant: 'indigo' | 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate' = 'indigo';
  let readinessLabel = 'Ready to Start';
  if (readiness === 'TARGET_REACHED') {
    readinessBadgeVariant = 'emerald';
    readinessLabel = 'Mastered';
  } else if (readiness === 'FOUNDATION_REQUIRED' || readiness === 'NOT_READY') {
    readinessBadgeVariant = 'rose';
    readinessLabel = 'Prereq Required';
  } else if (readiness === 'NEAR_TARGET') {
    readinessBadgeVariant = 'cyan';
    readinessLabel = 'Near Target';
  }

  return (
    <div className={`surface-card rounded-xl p-4 flex flex-col justify-between space-y-3.5 ${isBottleneck ? 'border-rose-500/30' : ''}`}>
      <div className="space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
            {cat}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isBottleneck && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-rose-500/15 text-rose-300 border border-rose-500/30">
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
          <h4 className="text-sm font-semibold text-white tracking-tight">{name}</h4>
          {gap && gap.explanation && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {gap.explanation}
            </p>
          )}
        </div>

        {/* Progression: Current -> Target -> Gap */}
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/[0.04] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Current: <strong className="text-white font-medium">{cur}%</strong>
            </span>
            <span className="text-slate-400">
              Target: <strong className="text-slate-300 font-medium">{tgt}%</strong>
            </span>
            <span className="text-rose-400 font-semibold text-[11px]">
              -{delta}% Gap
            </span>
          </div>

          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${isBottleneck ? 'bg-rose-500' : 'bg-indigo-600'}`}
              style={{ width: `${Math.min(100, Math.max(4, cur))}%` }}
            />
          </div>
        </div>

        {/* Unsatisfied Prereqs */}
        {unsatisfied.length > 0 && (
          <div className="flex items-start gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded p-1.5">
            <Lock className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
            <span>Requires: {unsatisfied.join(', ')}</span>
          </div>
        )}

        {/* Downstream unlock indicator */}
        {downstreamCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 font-medium">
            <Zap className="w-3 h-3 text-indigo-400" />
            <span>Unlocks {downstreamCount} downstream competencies</span>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
        {onInspectSkill && slug && (
          <button
            onClick={() => onInspectSkill(slug)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] transition-colors"
            title="Inspect Prerequisite Node"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        )}

        <Link
          href="/recommendations"
          className="inline-flex items-center justify-between flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-white/[0.06] transition-colors"
        >
          <span>Bridge Gap</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
        </Link>
      </div>
    </div>
  );
};
