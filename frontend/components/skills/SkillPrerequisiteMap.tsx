'use client';

import React, { useState } from 'react';
import { Layers, CheckCircle2, Lock, Play, ShieldAlert, Award } from 'lucide-react';
import type { Skill, LearnerSkill, IntelligentSkillGap } from '../../types';

interface SkillPrerequisiteMapProps {
  skills: Skill[];
  learnerSkills?: LearnerSkill[];
  skillGaps?: IntelligentSkillGap[];
  activeCareerName?: string;
  onInspectSkill?: (skillSlug: string) => void;
}

export const SkillPrerequisiteMap: React.FC<SkillPrerequisiteMapProps> = ({
  skills,
  learnerSkills = [],
  skillGaps = [],
  activeCareerName = 'Target Track',
  onInspectSkill,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(skills[0] || null);

  const learnerSkillMap = new Map<string, LearnerSkill>(
    learnerSkills.map((ls) => [ls.skill_id, ls])
  );

  const gapMap = new Map<string, IntelligentSkillGap>(
    skillGaps.map((g) => [g.skill_id, g])
  );

  // Group skills by Level / Tier
  const tier1 = skills.filter((s) => s.level <= 2);
  const tier2 = skills.filter((s) => s.level >= 3 && s.level <= 4);
  const tier3 = skills.filter((s) => s.level >= 5 && s.level <= 6);
  const tier4 = skills.filter((s) => s.level >= 7);

  const tiers = [
    { name: 'Tier 1 • Foundations', skills: tier1 },
    { name: 'Tier 2 • Core Principles', skills: tier2 },
    { name: 'Tier 3 • Applied Engineering', skills: tier3 },
    { name: 'Tier 4 • Advanced Systems', skills: tier4 },
  ].filter((t) => t.skills.length > 0);

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Header & Status Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#007AFF]" />
            <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Topological Prerequisite Skill Graph
            </h3>
          </div>
          <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-0.5">
            DAG nodes representing prerequisite dependencies and mastery unlock sequence
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-[#34C759] font-medium">
            <CheckCircle2 className="w-3 h-3" /> Mastered (80%+)
          </span>
          <span className="flex items-center gap-1 text-[#007AFF] font-medium">
            <Play className="w-3 h-3" /> In Progress
          </span>
          <span className="flex items-center gap-1 text-[#FF3B30] font-medium">
            <ShieldAlert className="w-3 h-3" /> Bottleneck
          </span>
          <span className="flex items-center gap-1 text-[#86868B] font-medium">
            <Lock className="w-3 h-3" /> Prereq Required
          </span>
        </div>
      </div>

      {/* Progressive Tier Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div key={tier.name} className="space-y-3">
            <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider px-1">
              {tier.name}
            </div>

            <div className="space-y-2">
              {tier.skills.map((s) => {
                const ls = learnerSkillMap.get(s.id);
                const gap = gapMap.get(s.id);
                const score = ls ? ls.score : 0;
                const isSelected = selectedSkill?.id === s.id;
                const isMastered = score >= 80;
                const isBottleneck = gap?.is_bottleneck || false;
                const isPrereqMet = gap ? gap.is_prerequisite_met : (s.prerequisites.length === 0 || score > 0);

                let cardStyle = 'bg-white dark:bg-[#1C1C1E] border-[#E5E5EA] dark:border-[#2C2C2E] hover:border-[#007AFF]/40';
                if (isSelected) {
                  cardStyle = 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border-[#007AFF] ring-1 ring-[#007AFF]/30';
                } else if (isBottleneck) {
                  cardStyle = 'bg-[#FFF0EF] dark:bg-[#FF453A]/10 border-[#FF3B30]/30 hover:border-[#FF3B30]';
                } else if (isMastered) {
                  cardStyle = 'bg-[#EAF8EE] dark:bg-[#30D158]/10 border-[#34C759]/30 hover:border-[#34C759]';
                } else if (!isPrereqMet) {
                  cardStyle = 'bg-[#F5F5F7] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] opacity-60';
                }

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedSkill(s);
                      if (onInspectSkill) onInspectSkill(s.slug);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all shadow-sm ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] text-[#86868B] uppercase tracking-wide truncate">
                        {s.category}
                      </span>
                      {isMastered ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                      ) : isBottleneck ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />
                      ) : !isPrereqMet ? (
                        <Lock className="w-3 h-3 text-[#86868B] shrink-0" />
                      ) : null}
                    </div>

                    <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight truncate">
                      {s.name}
                    </h4>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#6E6E73] dark:text-[#AEAEB2]">
                      <span>Proficiency: {score}%</span>
                      {s.prerequisites.length > 0 && (
                        <span>{s.prerequisites.length} prereq{s.prerequisites.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
