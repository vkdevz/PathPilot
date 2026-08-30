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
      <div className="flex items-center justify-between text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
        <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
          Question {currentQuestion} <span className="text-[#86868B]">/ {totalQuestions}</span>
        </span>
        <span className="font-mono text-[#007AFF] font-bold">{progressPct}%</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] overflow-hidden">
        <div
          className="h-full bg-[#007AFF] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
};
