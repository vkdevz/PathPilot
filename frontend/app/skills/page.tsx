'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Sparkles, RefreshCw, AlertCircle, ArrowRight, Target, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { Skill, LearnerSkill, LearningPath, CareerReadinessSummary } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { SkillProgress } from '../../components/skills/SkillProgress';
import { SkillGapCard } from '../../components/skills/SkillGapCard';
import { SkillPrerequisiteMap } from '../../components/skills/SkillPrerequisiteMap';
import { CareerReadinessCard } from '../../components/skills/CareerReadinessCard';
import { NextBestSkillHero } from '../../components/skills/NextBestSkillHero';
import { SkillDetailModal } from '../../components/skills/SkillDetailModal';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learnerSkills, setLearnerSkills] = useState<LearnerSkill[]>([]);
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [readinessSummary, setReadinessSummary] = useState<CareerReadinessSummary | null>(null);
  const [selectedModalSlug, setSelectedModalSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSkillsData = async () => {
    setLoading(true);
    try {
      const [allSkillsData, mySkillsData, roadmapData, gapData] = await Promise.allSettled([
        apiClient.getAllSkills(),
        apiClient.getMySkills(),
        apiClient.getRoadmap(),
        apiClient.getMySkillGaps(),
      ]);

      if (allSkillsData.status === 'fulfilled') setSkills(allSkillsData.value);
      if (mySkillsData.status === 'fulfilled') setLearnerSkills(mySkillsData.value);
      if (roadmapData.status === 'fulfilled') setRoadmap(roadmapData.value);
      if (gapData.status === 'fulfilled') setReadinessSummary(gapData.value);
    } catch (e) {
      console.error('Error fetching skills data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const handleInspectSkill = (slug: string) => {
    setSelectedModalSlug(slug);
  };

  return (
    <AppShell
      pageTitle="Skills Hub & Knowledge Graph"
      pageSubtitle="Analyze your assessed competencies, topological prerequisite DAG, identified bottlenecks, and career readiness."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSkillsData}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition-colors"
            title="Refresh Skill Intelligence"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href={`/assessment/${roadmap?.career_id || 'data-scientist'}`}>
            <Button variant="glow" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Calibrate Skills
            </Button>
          </Link>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Career Readiness Card */}
          {readinessSummary && (
            <CareerReadinessCard summary={readinessSummary} />
          )}

          {/* Next Best Skill Hero Banner */}
          {readinessSummary?.next_best_skill && (
            <NextBestSkillHero
              nextBestSkill={readinessSummary.next_best_skill}
              onInspectSkill={handleInspectSkill}
            />
          )}

          {/* Interactive Prerequisite DAG Map */}
          <SkillPrerequisiteMap
            skills={skills}
            learnerSkills={learnerSkills}
            skillGaps={readinessSummary?.skill_gaps}
            activeCareerName={readinessSummary?.career_name || roadmap?.career_name || 'Active Career Track'}
            onInspectSkill={handleInspectSkill}
          />

          {/* Strategic Bottlenecks & Critical Gaps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Prioritized Competency Gaps & Bottlenecks
                </h3>
              </div>
              <span className="text-xs text-slate-400">Target Benchmark: 85%</span>
            </div>

            {readinessSummary?.skill_gaps && readinessSummary.skill_gaps.filter((g) => g.raw_gap > 0.10).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {readinessSummary.skill_gaps
                  .filter((g) => g.raw_gap > 0.10)
                  .map((gap) => (
                    <SkillGapCard
                      key={gap.skill_id}
                      gap={gap}
                      onInspectSkill={handleInspectSkill}
                    />
                  ))}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-6 text-center text-xs text-slate-400">
                <p>No critical gaps detected. All assessed competencies meet or exceed targets.</p>
              </div>
            )}
          </div>

          {/* Complete Assessed Competencies Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  All Assessed Competencies
                </h3>
              </div>
              <span className="text-xs text-slate-400">{learnerSkills.length} Total Assessed</span>
            </div>

            {learnerSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {learnerSkills.map((sk) => (
                  <SkillProgress key={sk.id} skill={sk} targetScore={85} />
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-8 text-center text-xs text-slate-400 space-y-3">
                <p>No skills assessed yet. Take a diagnostic assessment to calibrate your skill graph.</p>
                <Link href="/careers">
                  <Button variant="primary" size="sm">
                    Select Career & Take Quiz
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Skill Detail Modal */}
          <SkillDetailModal
            isOpen={selectedModalSlug !== null}
            onClose={() => setSelectedModalSlug(null)}
            skillSlug={selectedModalSlug}
          />
        </div>
      )}
    </AppShell>
  );
}
