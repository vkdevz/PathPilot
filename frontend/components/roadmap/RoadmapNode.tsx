'use client';

import React from 'react';
import { CheckCircle2, Play, Lock, Clock, ExternalLink } from 'lucide-react';
import type { MilestoneItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface RoadmapNodeProps {
  milestone: MilestoneItem;
  isLast?: boolean;
  onComplete?: (id: string) => void;
  onFeedback?: (id: string, type: 'too_easy' | 'too_hard') => void;
  loading?: boolean;
  feedbackGiven?: string | null;
}

export const RoadmapNode: React.FC<RoadmapNodeProps> = ({
  milestone,
  isLast = false,
  onComplete,
  onFeedback,
  loading = false,
  feedbackGiven,
}) => {
  const isCompleted = milestone.status === 'completed';
  const isAvailable = milestone.status === 'available';
  const isLocked = milestone.status === 'locked';

  return (
    <div className="relative flex items-start gap-4 group">
      {/* Connector Line */}
      {!isLast && (
        <div
          className={`absolute left-4 top-10 bottom-0 w-[1px] transition-colors ${
            isCompleted ? 'bg-indigo-500/40' : 'bg-slate-800'
          }`}
        />
      )}

      {/* Node Status Indicator */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border z-10 text-xs font-semibold transition-all ${
          isCompleted
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : isAvailable
            ? 'bg-indigo-600 border-indigo-500 text-white'
            : 'bg-slate-900 border-white/[0.06] text-slate-500'
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : isAvailable ? (
          <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
        ) : (
          <Lock className="w-3.5 h-3.5" />
        )}
      </div>

      {/* Milestone Card Surface */}
      <div
        className={`flex-1 p-4 sm:p-5 rounded-xl border transition-all ${
          isAvailable
            ? 'surface-card border-indigo-500/40 shadow-sm'
            : isCompleted
            ? 'surface-card opacity-90'
            : 'surface-card opacity-50'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Step {milestone.step_order}
            </span>
            <span className="text-xs text-slate-400">
              • {milestone.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              {milestone.estimated_hours}h
            </span>
            <Badge
              variant={isCompleted ? 'emerald' : isAvailable ? 'indigo' : 'slate'}
              size="sm"
            >
              {milestone.status}
            </Badge>
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
          {milestone.skill_name}
        </h3>

        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {milestone.recommendation_reason ||
            'Foundational competency sequenced to bridge target role requirements.'}
        </p>

        {/* Linked Learning Resource */}
        {milestone.resource && (
          <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/[0.04] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-indigo-300 uppercase block">
                {milestone.resource.resource_type} • {milestone.resource.provider}
              </span>
              <span className="text-xs font-medium text-white truncate block">
                {milestone.resource.title}
              </span>
            </div>
            {milestone.resource.url && (
              <a
                href={milestone.resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                aria-label="Open resource"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Action Controls & Pacing Feedback */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2">
          {isAvailable && onComplete && (
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              onClick={() => onComplete(milestone.id)}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Mark Done
            </Button>
          )}

          {isCompleted && (
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed (+100 XP)
            </span>
          )}

          {onFeedback && (isAvailable || isCompleted) && (
            <div className="flex items-center gap-1.5 ml-auto text-xs">
              <span className="text-[11px] text-slate-500">Pacing:</span>
              <button
                onClick={() => onFeedback(milestone.id, 'too_easy')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  feedbackGiven === 'too_easy'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-400 border-white/[0.06] hover:text-white'
                }`}
              >
                Too Easy
              </button>
              <button
                onClick={() => onFeedback(milestone.id, 'too_hard')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  feedbackGiven === 'too_hard'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-400 border-white/[0.06] hover:text-white'
                }`}
              >
                Too Hard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
