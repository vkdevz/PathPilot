import React from 'react';
import { MilestoneItem } from '../../types';
import { RoadmapNode } from './RoadmapNode';

interface RoadmapPhaseProps {
  phaseTitle: string;
  phaseDescription?: string;
  milestones: MilestoneItem[];
  onComplete?: (id: string) => void;
  onFeedback?: (id: string, type: 'too_easy' | 'too_hard') => void;
  loadingId?: string | null;
  feedbackMap?: Record<string, string>;
}

export const RoadmapPhase: React.FC<RoadmapPhaseProps> = ({
  phaseTitle,
  phaseDescription,
  milestones,
  onComplete,
  onFeedback,
  loadingId,
  feedbackMap = {},
}) => {
  const completedInPhase = milestones.filter((m) => m.status === 'completed').length;
  const isPhaseComplete = completedInPhase === milestones.length && milestones.length > 0;

  return (
    <div className="space-y-4">
      {/* Phase Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {phaseTitle}
          </h3>
          {phaseDescription && (
            <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-0.5">{phaseDescription}</p>
          )}
        </div>

        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded border self-start sm:self-center ${
            isPhaseComplete
              ? 'bg-[#EAF8EE] text-[#34C759] border-[#34C759]/20'
              : 'bg-[#EAF3FF] text-[#007AFF] border-[#007AFF]/20'
          }`}
        >
          {completedInPhase} / {milestones.length} Completed
        </span>
      </div>

      {/* Sequential Milestone Nodes */}
      <div className="space-y-4">
        {milestones.map((m, idx) => (
          <RoadmapNode
            key={m.id}
            milestone={m}
            isLast={idx === milestones.length - 1}
            onComplete={onComplete}
            onFeedback={onFeedback}
            loading={loadingId === m.id}
            feedbackGiven={feedbackMap[m.id]}
          />
        ))}
      </div>
    </div>
  );
};
