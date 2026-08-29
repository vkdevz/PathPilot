'use client';

import React from 'react';
import { CheckCircle2, Play, Lock, Clock, Sparkles, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
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
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Connector Line */}
      {!isLast && (
        <div
          className={`absolute left-5 sm:left-6 top-12 bottom-0 w-0.5 -ml-[1px] transition-colors ${
            isCompleted ? 'bg-emerald-500/50' : 'bg-slate-800'
          }`}
        />
      )}

      {/* Status Icon */}
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border z-10 transition-all ${
          isCompleted
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-glow-emerald'
            : isAvailable
            ? 'bg-indigo-600 border-indigo-400 text-white shadow-glow-indigo animate-pulse-subtle'
            : 'bg-slate-900 border-slate-800 text-slate-600'
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : isAvailable ? (
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white ml-0.5" />
        ) : (
          <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </div>

      {/* Milestone Card */}
      <div
        className={`flex-1 p-5 rounded-3xl border transition-all ${
          isAvailable
            ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-950/40'
            : isCompleted
            ? 'glass-panel opacity-95'
            : 'bg-slate-950/40 border-slate-900 opacity-60'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Step {milestone.step_order}
            </span>
            <Badge variant="slate">{milestone.category}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" /> ~{milestone.estimated_hours}h
            </span>
            <Badge
              variant={isCompleted ? 'emerald' : isAvailable ? 'indigo' : 'slate'}
            >
              {milestone.status}
            </Badge>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {milestone.skill_name}
        </h3>

        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          {milestone.recommendation_reason ||
            'Core progressive capability calibrated to bridge your target career competency requirements.'}
        </p>

        {/* Linked Resource snippet if available */}
        {milestone.resource && (
          <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-cyan-400 uppercase block">
                {milestone.resource.resource_type} • {milestone.resource.provider}
              </span>
              <span className="text-xs font-semibold text-white truncate block">
                {milestone.resource.title}
              </span>
            </div>
            {milestone.resource.url && (
              <a
                href={milestone.resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                aria-label="Open learning resource"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Milestone Action & Feedback Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {isAvailable && onComplete && (
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              onClick={() => onComplete(milestone.id)}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Mark Completed & Unlock Next
            </Button>
          )}

          {isCompleted && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Completed (+100 XP awarded)
            </span>
          )}

          {/* Micro Feedback */}
          {onFeedback && (isAvailable || isCompleted) && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] text-slate-400">Pacing:</span>
              <button
                onClick={() => onFeedback(milestone.id, 'too_easy')}
                title="Too Easy - Speed up pacing"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  feedbackGiven === 'too_easy'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border-slate-750'
                }`}
              >
                ⚡ Too Easy
              </button>
              <button
                onClick={() => onFeedback(milestone.id, 'too_hard')}
                title="Too Hard - Add preparatory exercises"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  feedbackGiven === 'too_hard'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border-slate-750'
                }`}
              >
                📚 Too Hard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
