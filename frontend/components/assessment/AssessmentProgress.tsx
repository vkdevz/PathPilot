import React from 'react';

interface AssessmentProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  currentQuestion,
  totalQuestions,
}) => {
  const progressPct = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-white">
          Question {currentQuestion} <span className="text-slate-500">/ {totalQuestions}</span>
        </span>
        <span className="font-mono text-indigo-400 font-semibold">{progressPct}%</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-white/[0.06]">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
};
