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
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {phaseTitle}
          </h3>
          {phaseDescription && (
            <p className="text-xs text-slate-400 mt-0.5">{phaseDescription}</p>
          )}
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full border self-start sm:self-center ${
            isPhaseComplete
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
          }`}
        >
          {completedInPhase}/{milestones.length} Completed
        </span>
      </div>

      {/* Sequential Milestone Nodes */}
      <div className="space-y-6">
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
