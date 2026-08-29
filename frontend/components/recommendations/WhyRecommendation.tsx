'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, HelpCircle, Target, Layers, Activity, Zap, Cpu } from 'lucide-react';
import type { FeatureScoreBreakdown } from '../../types';

interface WhyRecommendationProps {
  reasons: string[];
  relevanceScore?: number;
  matchTier?: string;
  featureBreakdown?: FeatureScoreBreakdown | null;
  defaultOpen?: boolean;
}

export const WhyRecommendation: React.FC<WhyRecommendationProps> = ({
  reasons,
  relevanceScore = 90,
  matchTier = 'Top Recommendation',
  featureBreakdown,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="rounded-2xl bg-slate-950/80 border border-slate-800/90 overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-200">Why this recommendation?</span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
            {relevanceScore}% Match • {matchTier}
          </span>
        </div>

        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-900/80">
          <ul className="space-y-1.5">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>

          {/* Sub-Score Telemetry Chips */}
          {featureBreakdown && (
            <div className="pt-2 border-t border-slate-900/80">
              <div className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Hybrid Signal Attribution
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Skill Gap</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-300">
                    {Math.round(featureBreakdown.skill_gap * 100)}%
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Roadmap</span>
                  <span className="text-[10px] font-mono font-bold text-cyan-300">
                    {Math.round(featureBreakdown.roadmap_affinity * 100)}%
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Semantic</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-300">
                    {Math.round(featureBreakdown.semantic_similarity * 100)}%
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Difficulty</span>
                  <span className="text-[10px] font-mono font-bold text-amber-300">
                    {Math.round(featureBreakdown.difficulty_fit * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
