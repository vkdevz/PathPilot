'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import type { NextBestSkill } from '../../types';
import { Button } from '../ui/Button';

interface NextBestSkillHeroProps {
  nextBestSkill: NextBestSkill;
  onInspectSkill?: (skillSlug: string) => void;
}

export const NextBestSkillHero: React.FC<NextBestSkillHeroProps> = ({
  nextBestSkill,
  onInspectSkill,
}) => {
  return (
    <div className="surface-accent-card rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Highest-Impact Next Skill
            </span>

            {nextBestSkill.is_bottleneck && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Prerequisite Bottleneck
              </span>
            )}

            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-400 border border-white/[0.06]">
              {nextBestSkill.domain || nextBestSkill.category}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {nextBestSkill.skill_name}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {nextBestSkill.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onInspectSkill && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onInspectSkill(nextBestSkill.skill_slug)}
              icon={<Layers className="w-3.5 h-3.5" />}
            >
              Inspect DAG Node
            </Button>
          )}

          <Link href="/recommendations">
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Start Learning
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
