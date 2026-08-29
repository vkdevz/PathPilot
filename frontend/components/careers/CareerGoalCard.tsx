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
      className={`glass-panel-interactive rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 ${
        isCurrent ? 'border-indigo-500/80 bg-indigo-950/20 shadow-glow-indigo' : ''
      }`}
    >
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="text-2xl p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
            {career.icon || '🚀'}
          </span>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              {career.market_demand_score}% Demand
            </span>
            {isCurrent && <Badge variant="indigo">Active Target</Badge>}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {career.category}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-0.5">
            {career.name}
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-3">
            {career.description}
          </p>
        </div>

        {/* Salary & Skills count */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1 font-semibold text-white">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>{career.salary_range}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{career.total_skills || 6}+ Essential Skills</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/assessment/${career.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Diagnostic Quiz</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </Link>

        {onSelectTrack && !isCurrent && (
          <Button
            variant="outline"
            size="sm"
            loading={loading}
            onClick={() => onSelectTrack(career.slug)}
            icon={<Check className="w-3.5 h-3.5 text-indigo-400" />}
          >
            Set as Goal
          </Button>
        )}
      </div>
    </div>
  );
};
