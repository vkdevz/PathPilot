'use client';

import React from 'react';
import Link from 'next/link';
import { Play, CheckCircle2, Sparkles, Clock, Target, ArrowRight, Info } from 'lucide-react';
import type { MilestoneItem } from '../../types';
import { Button } from '../ui/Button';

interface NextBestActionProps {
  milestone?: MilestoneItem | null;
  careerName?: string;
  onComplete?: (id: string) => void;
  loading?: boolean;
}

export const NextBestAction: React.FC<NextBestActionProps> = ({
  milestone,
  careerName = 'Target Role',
  onComplete,
  loading = false,
}) => {
  if (!milestone) {
    return (
      <div className="surface-card rounded-2xl p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-center mx-auto text-indigo-400">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">No Active Learning Path</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Choose your target career track to generate your personalized learning path.
          </p>
        </div>
        <Link href="/careers" className="inline-block pt-1">
          <Button variant="primary" size="sm">
            Select Career Track
          </Button>
        </Link>
      </div>
    );
  }

  const isCompleted = milestone.status === 'completed';

  return (
    <div className="surface-accent-card rounded-2xl p-6 space-y-4">
      {/* Top Tag & Metas */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded">
            Next Best Action
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Step {milestone.step_order}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {milestone.estimated_hours}h estimated
          </span>
          <span className="text-[11px] font-semibold text-amber-300">
            +100 XP
          </span>
        </div>
      </div>

      {/* Title & Category */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
          {milestone.category}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {milestone.skill_name}
        </h2>
      </div>

      {/* Pedagogical Rationale */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Why this is prioritized</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {milestone.recommendation_reason ||
            `Highest-impact prerequisite gap for ${careerName}. Unlocks subsequent applied milestone projects.`}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {milestone.resource?.url ? (
          <a
            href={milestone.resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Learning Resource</span>
          </a>
        ) : (
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Milestone</span>
          </Link>
        )}

        {onComplete && !isCompleted && (
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={() => onComplete(milestone.id)}
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Mark Completed
          </Button>
        )}

        <Link
          href="/recommendations"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 ml-auto transition-colors"
        >
          <span>View all recommendations</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
