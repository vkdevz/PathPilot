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
    <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 border-l-4 border-l-[#007AFF] shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#EAF3FF] dark:bg-[#0A84FF]/15 text-[#007AFF] border border-[#007AFF]/20">
              <Sparkles className="w-3 h-3 text-[#007AFF]" />
              Highest-Impact Next Skill
            </span>

            {nextBestSkill.is_bottleneck && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF0EF] dark:bg-[#FF453A]/15 text-[#FF3B30] border border-[#FF3B30]/20">
                <ShieldAlert className="w-3 h-3 text-[#FF3B30]" />
                Prerequisite Bottleneck
              </span>
            )}

            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#AEAEB2] border border-[#E5E5EA] dark:border-[#38383A]">
              {nextBestSkill.domain || nextBestSkill.category}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              {nextBestSkill.skill_name}
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-1 leading-relaxed">
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
