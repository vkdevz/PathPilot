'use client';

import React from 'react';
import { Target, CheckCircle2, AlertTriangle, Lock, ShieldCheck } from 'lucide-react';
import type { CareerReadinessSummary } from '../../types';

interface CareerReadinessCardProps {
  summary: CareerReadinessSummary;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({ summary }) => {
  const readiness = Math.round(summary.career_readiness_score || 0);
  const confidence = Math.round((summary.confidence_score || 0.5) * 100);

  let statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  let statusText = 'Foundations Phase';
  if (readiness >= 85) {
    statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    statusText = 'Industry Ready';
  } else if (readiness >= 60) {
    statusColor = 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20';
    statusText = 'Core Competency Advancing';
  }

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500/15 text-indigo-400">
              <Target className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              {summary.career_name} Track Readiness
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Graph-aware curriculum coverage factoring prerequisite depth and benchmark mastery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${statusColor}`}>
            {statusText}
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-900 text-slate-300 border border-white/[0.08] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {confidence}% Confidence
          </span>
        </div>
      </div>

      {/* Progress & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Readiness Meter */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-xl bg-slate-950/60 border border-white/[0.06] text-center space-y-1.5">
          <span className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-0.5">
            {readiness}
            <span className="text-lg text-indigo-400 font-normal">%</span>
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Overall Readiness
          </span>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-indigo-600 transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, readiness))}%` }}
            />
          </div>
        </div>

        {/* Breakdown Counts */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04] space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mastered</span>
            </div>
            <p className="text-base font-bold text-white">
              {summary.covered_skills_count || 0} <span className="text-xs text-slate-500 font-normal">/ {summary.required_skills_count || 0}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04] space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
              <Target className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
            <p className="text-base font-bold text-white">
              {summary.partial_skills_count || 0}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04] space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critical Gaps</span>
            </div>
            <p className="text-base font-bold text-white">
              {summary.critical_gaps_count || 0}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04] space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Prereq Blocked</span>
            </div>
            <p className="text-base font-bold text-white">
              {summary.blocked_skills_count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Top Strengths & Bottlenecks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/[0.04] text-xs">
        <div className="flex items-start gap-1.5">
          <span className="font-semibold text-emerald-400 shrink-0">Top Strengths:</span>
          <span className="text-slate-400">
            {summary.strongest_skills && summary.strongest_skills.length > 0
              ? summary.strongest_skills.join(', ')
              : 'Complete a diagnostic test to identify verified competencies'}
          </span>
        </div>

        <div className="flex items-start gap-1.5">
          <span className="font-semibold text-rose-400 shrink-0">Prerequisite Bottlenecks:</span>
          <span className="text-slate-400">
            {summary.bottlenecks && summary.bottlenecks.length > 0
              ? summary.bottlenecks.map((b) => b.skill_name).join(', ')
              : 'No blocking bottlenecks detected'}
          </span>
        </div>
      </div>
    </div>
  );
};
