'use client';

import React, { useState } from 'react';
import { Layers, ArrowRight, CheckCircle2, Lock, Play, Sparkles, ShieldAlert, Zap, BookOpen } from 'lucide-react';
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
  activeCareerName = 'Career Track',
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
    { name: 'Tier 1: Foundations', skills: tier1, color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10' },
    { name: 'Tier 2: Core Engineering', skills: tier2, color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' },
    { name: 'Tier 3: Applied Systems', skills: tier3, color: 'border-brand-500/40 text-brand-300 bg-brand-500/10' },
    { name: 'Tier 4: Advanced Mastery', skills: tier4, color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
  ].filter((t) => t.skills.length > 0);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Interactive Prerequisite Skill Graph
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Topological prerequisite DAG showing unlock paths and bottlenecks for {activeCareerName}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mastered (80%+)
          </span>
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" /> Key Bottleneck
          </span>
          <span className="flex items-center gap-1 text-indigo-400 font-medium">
            <Play className="w-3.5 h-3.5" /> In Progress
          </span>
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5" /> Blocked
          </span>
        </div>
      </div>

      {/* Progressive Tier Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {tiers.map((tier) => (
          <div key={tier.name} className="space-y-4">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold text-center ${tier.color}`}>
              {tier.name}
            </div>

            <div className="space-y-3">
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
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-glow-indigo'
                        : isBottleneck
                        ? 'bg-rose-950/20 border-rose-500/50 hover:border-rose-500/80'
                        : isMastered
                        ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/60'
                        : isPrereqMet
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Level {s.level}
                      </span>
                      {isBottleneck ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase bg-rose-500/10 px-1.5 py-0.5 rounded">
                          <ShieldAlert className="w-3 h-3" /> Bottleneck
                        </span>
                      ) : isMastered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isPrereqMet ? (
                        <Play className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white mb-2 leading-tight">
                      {s.name}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Proficiency:</span>
                      <span className={`font-bold ${isMastered ? 'text-emerald-400' : isBottleneck ? 'text-rose-400' : 'text-slate-200'}`}>
                        {score}%
                      </span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full ${isBottleneck ? 'bg-rose-500' : isMastered ? 'bg-emerald-400' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Skill Quick Inspector Banner */}
      {selectedSkill && (
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{selectedSkill.name}</span>
              <Badge variant="indigo" size="sm">Level {selectedSkill.level}</Badge>
              <span className="text-xs text-slate-400">{selectedSkill.domain || selectedSkill.category}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              {selectedSkill.description}
            </p>
          </div>

          {onInspectSkill && (
            <button
              onClick={() => onInspectSkill(selectedSkill.slug)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Full Graph View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
