'use client';

import React from 'react';
import Link from 'next/link';
import { Play, CheckCircle2, Sparkles, Clock, Target, ArrowRight, HelpCircle } from 'lucide-react';
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
  careerName = 'Target Track',
  onComplete,
  loading = false,
}) => {
  if (!milestone) {
    return (
      <div className="glass-card-glow rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">No Active Learning Path Calibrated</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Choose your target career track and complete a diagnostic assessment to generate your personalized next steps.
          </p>
        </div>
        <Link href="/careers">
          <Button variant="glow" size="md">
            Select Career Track
          </Button>
        </Link>
      </div>
    );
  }

  const isCompleted = milestone.status === 'completed';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/40 p-6 sm:p-8 shadow-glow-indigo">
      {/* Background radiant decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next Best Action • Step {milestone.step_order}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              ~{milestone.estimated_hours}h estimated
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
              +100 XP
            </span>
          </div>
        </div>

        {/* Milestone Title & Category */}
        <div>
          <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
            {milestone.category}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
            {milestone.skill_name}
          </h2>
        </div>

        {/* Why this next? Explanation Banner */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Why is this your recommended next step?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {milestone.recommendation_reason ||
              `Addresses key foundational competencies required for ${careerName}. Completing this unlocks advanced applied projects.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {milestone.resource?.url ? (
            <a
              href={milestone.resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Learning Resource</span>
            </a>
          ) : (
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Milestone</span>
            </Link>
          )}

          {onComplete && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              loading={loading}
              onClick={() => onComplete(milestone.id)}
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            >
              Mark Completed & Unlock Next
            </Button>
          )}

          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors ml-auto"
          >
            <span>Browse extra practice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
