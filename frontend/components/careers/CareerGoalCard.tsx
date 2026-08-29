'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, DollarSign, Layers, Sparkles, Check } from 'lucide-react';
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
      className={`surface-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 ${
        isCurrent ? 'border-indigo-500/50 bg-slate-900/90' : ''
      }`}
    >
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-xl p-2 rounded-xl bg-slate-950 border border-white/[0.08]">
            {career.icon || '🎯'}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {career.market_demand_score}% Demand
            </span>
            {isCurrent && <Badge variant="indigo" size="sm">Active Goal</Badge>}
          </div>
        </div>

        {/* Title & Category */}
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            {career.category}
          </span>
          <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
            {career.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {career.description}
          </p>
        </div>

        {/* Salary & Competencies */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-1 font-medium text-white">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>{career.salary_range}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{career.total_skills || 6} Key Skills</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/assessment/${career.slug}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
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
            icon={<Check className="w-3.5 h-3.5 text-indigo-400" />}
          >
            Set Target
          </Button>
        )}
      </div>
    </div>
  );
};
