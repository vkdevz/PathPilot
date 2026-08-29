'use client';

import React from 'react';
import { Target, CheckCircle2, AlertTriangle, Lock, ShieldCheck, HelpCircle } from 'lucide-react';
import type { CareerReadinessSummary } from '../../types';

interface CareerReadinessCardProps {
  summary: CareerReadinessSummary;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({ summary }) => {
  const readiness = summary.career_readiness_score || 0;
  const confidence = summary.confidence_score || 50;

  // Determine readiness status badge
  let statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  let statusText = 'Foundation Phase';
  if (readiness >= 85) {
    statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    statusText = 'Industry Ready';
  } else if (readiness >= 60) {
    statusColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    statusText = 'Core Competency Advancing';
  } else if (readiness >= 35) {
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    statusText = 'Developing Prerequisites';
  }

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-slate-800 shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40">
      {/* Decorative background glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Target className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {summary.career_name} Track Readiness
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Graph-aware curriculum coverage factoring prerequisite depth, critical skills, and benchmark mastery.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
              {statusText}
            </span>
            {summary.is_cold_start ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1" title="Preliminary diagnosis before taking formal diagnostic assessment">
                <HelpCircle className="w-3 h-3 text-amber-400" />
                Preliminary
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {confidence}% Confidence
              </span>
            )}
          </div>
        </div>

        {/* Readiness Meter & Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Percentage Progress */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <span className="text-4xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
              {readiness}
              <span className="text-xl font-normal text-indigo-400">%</span>
            </span>
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Overall Career Readiness</span>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, Math.max(5, readiness))}%` }}
              />
            </div>
          </div>

          {/* Counts Breakdown */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mastered</span>
              </div>
              <p className="text-lg font-bold text-white">
                {summary.covered_skills_count} <span className="text-xs text-slate-500 font-normal">/ {summary.required_skills_count}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                <Target className="w-3.5 h-3.5" />
                <span>In Progress</span>
              </div>
              <p className="text-lg font-bold text-white">
                {summary.partial_skills_count}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Critical Gaps</span>
              </div>
              <p className="text-lg font-bold text-white">
                {summary.critical_gaps_count}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Prereq Blocked</span>
              </div>
              <p className="text-lg font-bold text-white">
                {summary.blocked_skills_count}
              </p>
            </div>
          </div>
        </div>

        {/* Strongest & Bottlenecks Footer Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/70 text-xs">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-emerald-400 shrink-0">Strongest Areas:</span>
            <span className="text-slate-300">
              {summary.strongest_skills.length > 0 ? summary.strongest_skills.join(', ') : 'Take diagnostic assessment to identify top strengths'}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-semibold text-rose-400 shrink-0">Identified Bottlenecks:</span>
            <span className="text-slate-300">
              {summary.bottlenecks.length > 0
                ? summary.bottlenecks.map((b) => b.skill_name).join(', ')
                : 'No unblocking bottlenecks detected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
