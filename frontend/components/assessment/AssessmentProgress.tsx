import React from 'react';

interface AssessmentProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  timeRemainingSeconds?: number;
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  currentQuestion,
  totalQuestions,
  timeRemainingSeconds,
}) => {
  const progressPct = Math.round((currentQuestion / totalQuestions) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-panel rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-white">
          Question {currentQuestion} of {totalQuestions}
        </span>
        {timeRemainingSeconds !== undefined && (
          <span className="font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            ⏱️ {formatTime(timeRemainingSeconds)}
          </span>
        )}
      </div>

      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-brand-500 to-cyan-400 transition-all duration-300 shadow-glow-indigo"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
};
