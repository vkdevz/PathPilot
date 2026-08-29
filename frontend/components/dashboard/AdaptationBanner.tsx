'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, CheckCircle2, AlertTriangle, HelpCircle, X, History, Award } from 'lucide-react';
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
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: <Award className="w-3.5 h-3.5" />,
          label: 'Mastery Achieved'
        };
      case 'STRUGGLE_DETECTED':
      case 'ROADMAP_CHANGED':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'Path Reinforced'
        };
      case 'SKILL_UPDATED':
        return {
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: 'Proficiency Calibrated'
        };
      default:
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          icon: <Zap className="w-3.5 h-3.5" />,
          label: 'Adaptive Update'
        };
    }
  };

  const badge = getEventBadge(latest.event_type);

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60 p-5 shadow-xl shadow-indigo-950/20 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-400">
              <Zap className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  Adaptive Learning Engine
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  Pace: {estimatedPace} ({velocityRatio}x velocity)
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-200 line-clamp-1">
                {latest.reason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setSelectedEvent(latest)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why this changed?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explainable AI Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Explainable Adaptation Rationale</h3>
                  <span className="text-[11px] text-slate-400 font-medium">Algorithmic Telemetry & Pedagogical Grounding</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Trigger Event
                </span>
                <div className="text-xs font-mono text-indigo-300 bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/20">
                  {selectedEvent.trigger}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Verifiable Reason
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedEvent.reason}
                </p>
              </div>

              {selectedEvent.previous_state && Object.keys(selectedEvent.previous_state).length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Previous State</span>
                    <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto">
                      {JSON.stringify(selectedEvent.previous_state, null, 2)}
                    </pre>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                    <span className="text-[10px] font-bold text-indigo-300 block mb-1">Adapted State</span>
                    <pre className="text-[11px] text-indigo-200 font-mono overflow-x-auto">
                      {JSON.stringify(selectedEvent.new_state, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span>Engine Version: <strong className="text-slate-300">{selectedEvent.algorithm_version}</strong></span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
