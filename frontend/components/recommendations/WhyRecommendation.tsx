'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, HelpCircle } from 'lucide-react';
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
    <div className="rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#EAF3FF] text-[#007AFF] flex items-center justify-center">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Why this recommendation?</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EAF3FF] text-[#007AFF] border border-[#007AFF]/20">
            {relevanceScore}% Match • {matchTier}
          </span>
        </div>

        <div className="text-[#86868B]">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-[#E5E5EA] dark:border-[#38383A]">
          <ul className="space-y-1.5">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>

          {/* Sub-Score Telemetry Chips */}
          {featureBreakdown && (
            <div className="pt-2 border-t border-[#E5E5EA] dark:border-[#38383A]">
              <div className="text-[10px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider">
                Hybrid Signal Attribution
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <div className="p-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] flex items-center justify-between">
                  <span className="text-[10px] text-[#86868B]">Skill Gap</span>
                  <span className="text-[10px] font-mono font-bold text-[#007AFF]">
                    {Math.round(featureBreakdown.skill_gap * 100)}%
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] flex items-center justify-between">
                  <span className="text-[10px] text-[#86868B]">Roadmap</span>
                  <span className="text-[10px] font-mono font-bold text-[#007AFF]">
                    {Math.round(featureBreakdown.roadmap_affinity * 100)}%
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] flex items-center justify-between">
                  <span className="text-[10px] text-[#86868B]">Semantic</span>
                  <span className="text-[10px] font-mono font-bold text-[#34C759]">
                    {Math.round(featureBreakdown.semantic_similarity * 100)}%
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] flex items-center justify-between">
                  <span className="text-[10px] text-[#86868B]">Difficulty</span>
                  <span className="text-[10px] font-mono font-bold text-[#FF9F0A]">
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
