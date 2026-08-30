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

  let statusColor = 'text-[#FF9F0A] bg-[#FFF4E0] dark:bg-[#FF9F0A]/15 border-[#FF9F0A]/20';
  let statusText = 'Foundations Phase';
  if (readiness >= 85) {
    statusColor = 'text-[#34C759] bg-[#EAF8EE] dark:bg-[#30D158]/15 border-[#34C759]/20';
    statusText = 'Industry Ready';
  } else if (readiness >= 60) {
    statusColor = 'text-[#007AFF] bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border-[#007AFF]/20';
    statusText = 'Core Competency Advancing';
  }

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#EAF3FF] text-[#007AFF]">
              <Target className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {summary.career_name} Track Readiness
            </h2>
          </div>
          <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
            Graph-aware curriculum coverage factoring prerequisite depth and benchmark mastery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${statusColor}`}>
            {statusText}
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#E5E5EA] dark:border-[#38383A] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
            {confidence}% Confidence
          </span>
        </div>
      </div>

      {/* Progress & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Readiness Meter */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-center space-y-1.5">
          <span className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight flex items-baseline gap-0.5">
            {readiness}
            <span className="text-lg text-[#007AFF] font-normal">%</span>
          </span>
          <span className="text-[10px] uppercase font-semibold text-[#86868B] tracking-wider">
            Overall Readiness
          </span>

          <div className="w-full bg-[#E5E5EA] dark:bg-[#38383A] h-2 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-[#007AFF] transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, readiness))}%` }}
            />
          </div>
        </div>

        {/* Breakdown Counts */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-[#34C759] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mastered</span>
            </div>
            <p className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {summary.covered_skills_count || 0} <span className="text-xs text-[#86868B] font-normal">/ {summary.required_skills_count || 0}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-[#007AFF] font-medium">
              <Target className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
            <p className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {summary.partial_skills_count || 0}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-[#FF3B30] font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critical Gaps</span>
            </div>
            <p className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {summary.critical_gaps_count || 0}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-[#FF9F0A] font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Prereq Blocked</span>
            </div>
            <p className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {summary.blocked_skills_count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Top Strengths & Bottlenecks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#E5E5EA] dark:border-[#38383A] text-xs">
        <div className="flex items-start gap-1.5">
          <span className="font-semibold text-[#34C759] shrink-0">Top Strengths:</span>
          <span className="text-[#6E6E73] dark:text-[#AEAEB2]">
            {summary.strongest_skills && summary.strongest_skills.length > 0
              ? summary.strongest_skills.join(', ')
              : 'Complete a diagnostic test to identify verified competencies'}
          </span>
        </div>

        <div className="flex items-start gap-1.5">
          <span className="font-semibold text-[#FF3B30] shrink-0">Prerequisite Bottlenecks:</span>
          <span className="text-[#6E6E73] dark:text-[#AEAEB2]">
            {summary.bottlenecks && summary.bottlenecks.length > 0
              ? summary.bottlenecks.map((b) => b.skill_name).join(', ')
              : 'No blocking bottlenecks detected'}
          </span>
        </div>
      </div>
    </div>
  );
};
