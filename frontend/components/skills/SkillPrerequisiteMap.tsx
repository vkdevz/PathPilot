'use client';

import React, { useState } from 'react';
import { Layers, ArrowRight, CheckCircle2, Lock, Play, ShieldAlert, Zap, BookOpen } from 'lucide-react';
import type { Skill, LearnerSkill, IntelligentSkillGap } from '../../types';
import { Badge } from '../ui/Badge';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Topological Prerequisite Skill Graph
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            DAG nodes representing prerequisite dependencies and mastery unlock sequence
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Mastered (80%+)
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <Play className="w-3 h-3" /> In Progress
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <ShieldAlert className="w-3 h-3" /> Bottleneck
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Lock className="w-3 h-3" /> Prereq Required
          </span>
        </div>
      </div>

      {/* Progressive Tier Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div key={tier.name} className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
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

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedSkill(s);
                      if (onInspectSkill) onInspectSkill(s.slug);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50'
                        : isBottleneck
                        ? 'bg-rose-950/15 border-rose-500/40 hover:border-rose-400'
                        : isMastered
                        ? 'bg-slate-950/60 border-emerald-500/30 hover:border-emerald-400'
                        : isPrereqMet
                        ? 'bg-slate-950/60 border-white/[0.08] hover:border-indigo-500/40'
                        : 'bg-slate-950/30 border-white/[0.04] opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide truncate">
                        {s.category}
                      </span>
                      {isMastered ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : isBottleneck ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : !isPrereqMet ? (
                        <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                      ) : null}
                    </div>

                    <h4 className="text-xs font-semibold text-white tracking-tight truncate">
                      {s.name}
                    </h4>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
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
