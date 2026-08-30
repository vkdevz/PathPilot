'use client';

import React from 'react';
import Link from 'next/link';
import { Play, CheckCircle2, Clock, Target, ArrowRight, Info } from 'lucide-react';
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
        <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border border-[#007AFF]/20 flex items-center justify-center mx-auto text-[#007AFF]">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">No Active Learning Path</h3>
          <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] max-w-sm mx-auto mt-1">
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
    <div className="surface-card rounded-2xl p-6 space-y-4 border-l-4 border-l-[#007AFF] shadow-sm">
      {/* Top Tag & Metas */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF] bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border border-[#007AFF]/20 px-2 py-0.5 rounded">
            Next Best Action
          </span>
          <span className="text-xs text-[#86868B] font-mono">
            Step {milestone.step_order}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#86868B]" />
            {milestone.estimated_hours}h estimated
          </span>
          <span className="text-[11px] font-semibold text-[#FF9F0A]">
            +100 XP
          </span>
        </div>
      </div>

      {/* Title & Category */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] mb-0.5">
          {milestone.category}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          {milestone.skill_name}
        </h2>
      </div>

      {/* Pedagogical Rationale */}
      <div className="p-3.5 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#007AFF]">
          <Info className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Why this is prioritized</span>
        </div>
        <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] leading-relaxed">
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-[#006EDB] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Learning Resource</span>
          </a>
        ) : (
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-[#006EDB] text-white text-xs font-semibold shadow-sm transition-colors"
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
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />}
          >
            Mark Completed
          </Button>
        )}

        <Link
          href="/recommendations"
          className="inline-flex items-center gap-1 text-xs text-[#007AFF] hover:text-[#006EDB] ml-auto font-medium transition-colors"
        >
          <span>View all recommendations</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
