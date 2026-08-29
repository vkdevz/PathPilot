'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BookOpen, ShieldAlert, Lock, Unlock, Layers, Zap } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { IntelligentSkillGap } from '../../types';

interface SkillGapCardProps {
  gap?: IntelligentSkillGap;
  // Legacy / fallback props for backward compatibility
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
  const cat = gap ? (gap.domain || gap.category) : (propCategory || 'General');
  const cur = gap ? gap.current_score : (propCurrentScore || 0);
  const tgt = gap ? gap.target_score : (propTargetScore || 85);
  const delta = gap ? Math.round(gap.raw_gap * 100) : (propGapDelta || Math.max(0, tgt - cur));
  const isBottleneck = gap ? gap.is_bottleneck : false;
  const isPrereqMet = gap ? gap.is_prerequisite_met : true;
  const readiness = gap ? gap.readiness_state : 'READY_TO_START';
  const importance = gap ? gap.career_importance : 'high';
  const downstreamCount = gap ? gap.downstream_skills_count : 0;
  const unsatisfied = gap ? gap.unsatisfied_prerequisites : [];
  const slug = gap ? gap.skill_slug : '';

  // Readiness badge color
  let readinessBadgeVariant: 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate' = 'cyan';
  let readinessLabel = readiness.replace('_', ' ');
  if (readiness === 'TARGET_REACHED') {
    readinessBadgeVariant = 'emerald';
    readinessLabel = 'Mastered';
  } else if (readiness === 'FOUNDATION_REQUIRED' || readiness === 'NOT_READY') {
    readinessBadgeVariant = 'rose';
    readinessLabel = 'Prereq Locked';
  } else if (readiness === 'NEAR_TARGET') {
    readinessBadgeVariant = 'cyan';
    readinessLabel = 'Near Target';
  }

  return (
    <div className={`glass-panel-interactive rounded-2xl p-5 flex flex-col justify-between space-y-4 border ${isBottleneck ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-slate-900/60' : 'border-slate-800'}`}>
      <div className="space-y-3">
        {/* Top Header badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {cat}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isBottleneck && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Bottleneck
              </span>
            )}
            <Badge variant={readinessBadgeVariant} size="sm">
              {readinessLabel}
            </Badge>
          </div>
        </div>

        {/* Skill Title & Importance */}
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white tracking-tight">{name}</h4>
            <span className="text-[11px] font-medium text-slate-400 capitalize">
              {importance} Priority
            </span>
          </div>
          {gap && gap.explanation && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {gap.explanation}
            </p>
          )}
        </div>

        {/* Score & Gap comparison */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Assessed:</span>
              <span className="font-semibold text-white">{cur}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Benchmark:</span>
              <span className="font-semibold text-slate-300">{tgt}%</span>
            </div>
            <div className="flex items-center gap-1 text-rose-400 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>-{delta}% Gap</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${isBottleneck ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`}
              style={{ width: `${Math.min(100, Math.max(5, cur))}%` }}
            />
          </div>
        </div>

        {/* Downstream & Blocked info */}
        {unsatisfied.length > 0 && (
          <div className="flex items-start gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>Requires: {unsatisfied.join(', ')}</span>
          </div>
        )}

        {downstreamCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unlocks {downstreamCount} downstream competencies</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
        {onInspectSkill && slug && (
          <button
            onClick={() => onInspectSkill(slug)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Inspect Prerequisite Graph"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}

        <Link
          href="/recommendations"
          className="inline-flex items-center justify-center gap-1.5 flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Bridge Gap</span>
          <ArrowRight className="w-3 h-3 ml-auto text-slate-400" />
        </Link>
      </div>
    </div>
  );
};
