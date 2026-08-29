'use client';

import React from 'react';
import { History, Sparkles, AlertCircle, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import type { AdaptationEvent } from '../../types';

interface AdaptationTimelineProps {
  events: AdaptationEvent[];
}

export function AdaptationTimeline({ events }: AdaptationTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-6 text-center text-xs text-slate-400 space-y-2">
        <History className="w-6 h-6 text-slate-600 mx-auto" />
        <p>No adaptation timeline events recorded yet. Complete quizzes and study modules to activate the dynamic engine.</p>
      </div>
    );
  }

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'MASTERY_DETECTED':
        return {
          icon: <Award className="w-4 h-4 text-emerald-400" />,
          dot: 'bg-emerald-500',
          border: 'border-emerald-500/30'
        };
      case 'STRUGGLE_DETECTED':
      case 'ROADMAP_CHANGED':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
          dot: 'bg-amber-500',
          border: 'border-amber-500/30'
        };
      case 'SKILL_UPDATED':
        return {
          icon: <TrendingUp className="w-4 h-4 text-indigo-400" />,
          dot: 'bg-indigo-500',
          border: 'border-indigo-500/30'
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-blue-400" />,
          dot: 'bg-blue-500',
          border: 'border-blue-500/30'
        };
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Adaptive Progression Timeline
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          {events.length} Events Tracked
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.slice(0, 5).map((ev) => {
          const style = getEventStyle(ev.event_type);
          const dateStr = ev.created_at ? new Date(ev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';

          return (
            <div key={ev.id} className="relative group">
              {/* Dot */}
              <div className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${style.dot} ring-4 ring-slate-900`} />

              <div className={`p-4 rounded-2xl bg-slate-900/60 border ${style.border} space-y-1.5 transition-all hover:bg-slate-900`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {style.icon}
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                      {ev.event_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {dateStr}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {ev.reason}
                </p>

                <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-slate-500">
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
