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

  return (
    <div className="relative flex items-start gap-4 group">
      {/* Connector Line */}
      {!isLast && (
        <div
          className={`absolute left-4 top-10 bottom-0 w-[1px] transition-colors ${
            isCompleted ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#38383A]'
          }`}
        />
      )}

      {/* Node Status Indicator */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border z-10 text-xs font-semibold transition-all ${
          isCompleted
            ? 'bg-[#EAF8EE] dark:bg-[#30D158]/15 border-[#34C759]/30 text-[#34C759]'
            : isAvailable
            ? 'bg-[#007AFF] border-[#007AFF] text-white'
            : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#86868B]'
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
            ? 'surface-card border-l-4 border-l-[#007AFF] shadow-sm'
            : isCompleted
            ? 'surface-card opacity-90'
            : 'surface-card opacity-60'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF]">
              Step {milestone.step_order}
            </span>
            <span className="text-xs text-[#86868B]">
              • {milestone.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
              <Clock className="w-3 h-3 text-[#86868B]" />
              {milestone.estimated_hours}h
            </span>
            <Badge
              variant={isCompleted ? 'success' : isAvailable ? 'primary' : 'slate'}
              size="sm"
            >
              {milestone.status}
            </Badge>
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          {milestone.skill_name}
        </h3>

        <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-1 leading-relaxed">
          {milestone.recommendation_reason ||
            'Foundational competency sequenced to bridge target role requirements.'}
        </p>

        {/* Linked Learning Resource */}
        {milestone.resource && (
          <div className="mt-3 p-3 rounded-lg bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-[#007AFF] uppercase block">
                {milestone.resource.resource_type} • {milestone.resource.provider}
              </span>
              <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate block">
                {milestone.resource.title}
              </span>
            </div>
            {milestone.resource.url && (
              <a
                href={milestone.resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#007AFF] border border-[#D2D2D7] dark:border-[#38383A] transition-colors shrink-0"
                aria-label="Open resource"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Action Controls & Pacing Feedback */}
        <div className="mt-3.5 pt-3 border-t border-[#E5E5EA] dark:border-[#38383A] flex flex-wrap items-center justify-between gap-2">
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
            <span className="text-xs font-medium text-[#34C759] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed (+100 XP)
            </span>
          )}

          {onFeedback && (isAvailable || isCompleted) && (
            <div className="flex items-center gap-1.5 ml-auto text-xs">
              <span className="text-[11px] text-[#86868B]">Pacing:</span>
              <button
                onClick={() => onFeedback(milestone.id, 'too_easy')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  feedbackGiven === 'too_easy'
                    ? 'bg-[#007AFF] text-white border-[#007AFF]'
                    : 'bg-white dark:bg-[#1C1C1E] text-[#6E6E73] border-[#D2D2D7] dark:border-[#38383A] hover:text-[#1D1D1F]'
                }`}
              >
                Too Easy
              </button>
              <button
                onClick={() => onFeedback(milestone.id, 'too_hard')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  feedbackGiven === 'too_hard'
                    ? 'bg-[#007AFF] text-white border-[#007AFF]'
                    : 'bg-white dark:bg-[#1C1C1E] text-[#6E6E73] border-[#D2D2D7] dark:border-[#38383A] hover:text-[#1D1D1F]'
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
