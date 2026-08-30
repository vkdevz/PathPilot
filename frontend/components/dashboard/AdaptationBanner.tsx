'use client';

import React, { useState } from 'react';
import { Sparkles, Zap, AlertTriangle, HelpCircle, X, Award } from 'lucide-react';
import type { AdaptationEvent } from '../../types';

interface AdaptationBannerProps {
  recentEvents: AdaptationEvent[];
  estimatedPace?: string;
  velocityRatio?: number;
}

export function AdaptationBanner({ recentEvents, estimatedPace = 'NORMAL', velocityRatio = 1.0 }: AdaptationBannerProps) {
  const [selectedEvent, setSelectedEvent] = useState<AdaptationEvent | null>(null);

  if (!recentEvents || recentEvents.length === 0) {
    return null;
  }

  const latest = recentEvents[0];

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'MASTERY_DETECTED':
        return {
          bg: 'bg-[#EAF8EE] dark:bg-[#30D158]/15 text-[#34C759] border-[#34C759]/20',
          icon: <Award className="w-3.5 h-3.5" />,
          label: 'Mastery Verified'
        };
      case 'STRUGGLE_DETECTED':
      case 'ROADMAP_CHANGED':
        return {
          bg: 'bg-[#FFF4E0] dark:bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/20',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'Pacing Recalibrated'
        };
      case 'SKILL_UPDATED':
        return {
          bg: 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 text-[#007AFF] border-[#007AFF]/20',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: 'Proficiency Updated'
        };
      default:
        return {
          bg: 'bg-[#EEF9FF] dark:bg-[#5AC8FA]/15 text-[#007AFF] border-[#5AC8FA]/20',
          icon: <Zap className="w-3.5 h-3.5" />,
          label: 'Adaptive Update'
        };
    }
  };

  const badge = getEventBadge(latest.event_type);

  return (
    <>
      <div className="surface-card rounded-2xl p-5 border-l-4 border-l-[#007AFF] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border border-[#007AFF]/20 flex items-center justify-center shrink-0 text-[#007AFF]">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Adaptive Engine
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
                <span className="text-[10px] font-medium text-[#6E6E73] dark:text-[#AEAEB2] bg-[#F5F5F7] dark:bg-[#2C2C2E] px-2 py-0.5 rounded border border-[#E5E5EA] dark:border-[#38383A]">
                  Pace: {estimatedPace} ({velocityRatio}x velocity)
                </span>
              </div>
              <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-1">
                {latest.reason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setSelectedEvent(latest)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[#007AFF] border border-[#D2D2D7] dark:border-[#38383A] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why this changed?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explainable AI Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] text-[#007AFF] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Adaptation Rationale</h3>
                  <span className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] font-medium">Algorithmic Telemetry & Pedagogical Grounding</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-xl text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-1">
                  Trigger Event
                </span>
                <div className="text-xs font-mono text-[#007AFF] bg-[#EAF3FF] dark:bg-[#0A84FF]/10 p-2 rounded-lg border border-[#007AFF]/20">
                  {selectedEvent.trigger}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-1">
                  Verifiable Reason
                </span>
                <p className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                  {selectedEvent.reason}
                </p>
              </div>

              {selectedEvent.previous_state && Object.keys(selectedEvent.previous_state).length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5EA] dark:border-[#38383A] text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A]">
                    <span className="text-[10px] font-bold text-[#86868B] block mb-1">Previous State</span>
                    <pre className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] font-mono overflow-x-auto">
                      {JSON.stringify(selectedEvent.previous_state, null, 2)}
                    </pre>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#EAF3FF] dark:bg-[#0A84FF]/10 border border-[#007AFF]/20">
                    <span className="text-[10px] font-bold text-[#007AFF] block mb-1">Adapted State</span>
                    <pre className="text-[11px] text-[#007AFF] font-mono overflow-x-auto">
                      {JSON.stringify(selectedEvent.new_state, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#86868B] pt-2 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
              <span>Engine Version: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">{selectedEvent.algorithm_version}</strong></span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-[#006EDB] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
