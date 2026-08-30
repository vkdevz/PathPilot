'use client';

import React from 'react';
import { History, Sparkles, AlertCircle, Award, TrendingUp } from 'lucide-react';
import type { AdaptationEvent } from '../../types';

interface AdaptationTimelineProps {
  events: AdaptationEvent[];
}

export function AdaptationTimeline({ events }: AdaptationTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-6 text-center text-xs text-[#86868B] space-y-2">
        <History className="w-5 h-5 text-[#86868B] mx-auto" />
        <p>No adaptation timeline events recorded yet. Complete diagnostic quizzes and study modules to activate the dynamic engine.</p>
      </div>
    );
  }

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'MASTERY_DETECTED':
        return {
          icon: <Award className="w-4 h-4 text-[#34C759]" />,
          dot: 'bg-[#34C759]',
          border: 'border-[#34C759]/20'
        };
      case 'STRUGGLE_DETECTED':
      case 'ROADMAP_CHANGED':
        return {
          icon: <AlertCircle className="w-4 h-4 text-[#FF9F0A]" />,
          dot: 'bg-[#FF9F0A]',
          border: 'border-[#FF9F0A]/20'
        };
      case 'SKILL_UPDATED':
        return {
          icon: <TrendingUp className="w-4 h-4 text-[#007AFF]" />,
          dot: 'bg-[#007AFF]',
          border: 'border-[#007AFF]/20'
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-[#5AC8FA]" />,
          dot: 'bg-[#5AC8FA]',
          border: 'border-[#5AC8FA]/20'
        };
    }
  };

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#007AFF]" />
          <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Adaptation Timeline
          </h3>
        </div>
        <span className="text-[11px] font-medium text-[#86868B]">
          {events.length} Events Tracked
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E5EA] dark:before:bg-[#38383A]">
        {events.slice(0, 5).map((ev) => {
          const style = getEventStyle(ev.event_type);
          const dateStr = ev.created_at ? new Date(ev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';

          return (
            <div key={ev.id} className="relative">
              {/* Dot */}
              <div className={`absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full ${style.dot} ring-4 ring-white dark:ring-[#1C1C1E]`} />

              <div className={`p-3.5 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border ${style.border} space-y-1`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {style.icon}
                    <span className="text-[10px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] uppercase tracking-wider">
                      {ev.event_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-[#86868B]">
                    {dateStr}
                  </span>
                </div>

                <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] leading-relaxed">
                  {ev.reason}
                </p>

                <div className="pt-0.5 text-[10px] font-mono text-[#86868B]">
                  <span>Trigger: {ev.trigger}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
