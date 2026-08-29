'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, AlertCircle, ShieldAlert, Layers } from 'lucide-react';
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
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-cyan-950/50 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Authoritative Next Best Skill
            </span>

            {nextBestSkill.is_bottleneck && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Key Prerequisite Bottleneck
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {nextBestSkill.domain || nextBestSkill.category}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {nextBestSkill.skill_name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              {nextBestSkill.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onInspectSkill && (
            <button
              onClick={() => onInspectSkill(nextBestSkill.skill_slug)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Inspect Graph
            </button>
          )}

          <Link href="/recommendations">
            <Button
              variant="glow"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Study Recommended Material
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
