'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, DollarSign, Layers, Sparkles, Check } from 'lucide-react';
import type { Career } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CareerGoalCardProps {
  career: Career;
  isCurrent?: boolean;
  onSelectTrack?: (slug: string) => Promise<void>;
  loading?: boolean;
}

export const CareerGoalCard: React.FC<CareerGoalCardProps> = ({
  career,
  isCurrent = false,
  onSelectTrack,
  loading = false,
}) => {
  return (
    <div
      className={`surface-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm ${
        isCurrent ? 'border-l-4 border-l-[#007AFF] bg-[#FBFBFD] dark:bg-[#2C2C2E]' : ''
      }`}
    >
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-xl p-2 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A]">
            {career.icon || '🎯'}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#34C759] bg-[#EAF8EE] dark:bg-[#30D158]/15 px-2 py-0.5 rounded border border-[#34C759]/20">
              {career.market_demand_score}% Demand
            </span>
            {isCurrent && <Badge variant="primary" size="sm">Active Goal</Badge>}
          </div>
        </div>

        {/* Title & Category */}
        <div>
          <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">
            {career.category}
          </span>
          <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-0.5">
            {career.name}
          </h3>
          <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-1 leading-relaxed line-clamp-2">
            {career.description}
          </p>
        </div>

        {/* Salary & Competencies */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E6E73] dark:text-[#AEAEB2] pt-2 border-t border-[#E5E5EA] dark:border-[#38383A]">
          <div className="flex items-center gap-1 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
            <DollarSign className="w-3.5 h-3.5 text-[#34C759]" />
            <span>{career.salary_range}</span>
          </div>

          <div className="flex items-center gap-1 text-[#86868B] text-[11px]">
            <Layers className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>{career.total_skills || 6} Key Skills</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-3 border-t border-[#E5E5EA] dark:border-[#38383A] flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/assessment/${career.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#006EDB] text-white text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>Diagnostic Quiz</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </Link>

        {onSelectTrack && !isCurrent && (
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={() => onSelectTrack(career.slug)}
            icon={<Check className="w-3.5 h-3.5 text-[#007AFF]" />}
          >
            Set Target
          </Button>
        )}
      </div>
    </div>
  );
};
