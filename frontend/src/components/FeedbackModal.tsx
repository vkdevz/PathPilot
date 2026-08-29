import React from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  skillName: string;
  onFeedbackSubmit: (feedback: 'useful' | 'not_useful') => void;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ skillName, onFeedbackSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-slate-700 text-center space-y-4 animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/30">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Was this Recommendation Useful?</h3>
          <p className="text-xs text-slate-400 mt-1">
            Feedback on <span className="text-brand-300 font-semibold">{skillName}</span> will help calibrate future recommendations.
          </p>
        </div>
        <div className="flex space-x-3 pt-2">
          <button
            onClick={() => {
              onFeedbackSubmit('useful');
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Useful 👍</span>
          </button>
          <button
            onClick={() => {
              onFeedbackSubmit('not_useful');
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Not Useful 👎</span>
          </button>
        </div>
      </div>
    </div>
  );
};
