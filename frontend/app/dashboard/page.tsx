'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Milestone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BrainCircuit,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import type {
  LearningPath,
  Career,
  LearnerSkill,
  LearnerAdaptiveState,
  CareerReadinessSummary,
} from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { NextBestAction } from '../../components/dashboard/NextBestAction';
import { ProgressSummary } from '../../components/dashboard/ProgressSummary';
import { SkillGapCard } from '../../components/skills/SkillGapCard';
import { AdaptationBanner } from '../../components/dashboard/AdaptationBanner';
import { AdaptationTimeline } from '../../components/dashboard/AdaptationTimeline';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [skills, setSkills] = useState<LearnerSkill[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [adaptiveState, setAdaptiveState] = useState<LearnerAdaptiveState | null>(null);
  const [readiness, setReadiness] = useState<CareerReadinessSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [careersRes, roadmapRes, skillsRes, adaptiveRes, readinessRes] = await Promise.allSettled([
        apiClient.getCareers(),
        apiClient.getRoadmap(),
        apiClient.getMySkills(),
        apiClient.getAdaptiveState(),
        apiClient.getMySkillGaps(),
      ]);

      if (careersRes.status === 'fulfilled') setCareers(careersRes.value);
      if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value);
      else setRoadmap(null);
      if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value);
      if (adaptiveRes.status === 'fulfilled') setAdaptiveState(adaptiveRes.value);
      if (readinessRes.status === 'fulfilled') setReadiness(readinessRes.value);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCompleteMilestone = async (milestoneId: string) => {
    setCompletingId(milestoneId);
    try {
      await apiClient.completeMilestone(milestoneId);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to complete milestone:', err);
    } finally {
      setCompletingId(null);
    }
  };

  // Select active milestone
  const activeMilestone =
    roadmap?.milestones?.find((m) => m.status === 'available') ||
    roadmap?.milestones?.find((m) => m.status !== 'completed') ||
    roadmap?.milestones?.[0] ||
    null;

  const completedCount = roadmap?.milestones?.filter((m) => m.status === 'completed').length || 0;
  const totalCount = roadmap?.milestones?.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  // Derive skill gaps from readiness summary or local skills
  const skillGaps = readiness?.skill_gaps || [];
  const weakSkills = skillGaps.length > 0
    ? skillGaps.filter((g) => g.raw_gap > 0.15).map((g) => ({
        skill_slug: g.skill_slug,
        skill_name: g.skill_name,
        category: g.domain || g.category,
        current_proficiency: g.current_proficiency,
        target_proficiency: g.target_proficiency,
        gap_magnitude: g.raw_gap,
        career_importance: g.career_importance,
        career_weight: g.career_weight,
        is_prerequisite_bottleneck: g.is_bottleneck,
        prerequisite_chain: g.unsatisfied_prerequisites,
        suggested_priority: g.is_bottleneck || g.raw_gap > 0.4 ? ('high' as const) : ('medium' as const),
      }))
    : skills.filter((s) => s.score < 75).map((s) => ({
        skill_slug: s.skill_slug,
        skill_name: s.skill_name,
        category: s.category,
        current_proficiency: s.score / 100,
        target_proficiency: 0.85,
        gap_magnitude: Math.max(0, 0.85 - s.score / 100),
        career_importance: 'high',
        career_weight: 1.0,
        is_prerequisite_bottleneck: false,
        prerequisite_chain: [],
        suggested_priority: s.score < 50 ? ('high' as const) : ('medium' as const),
      }));

  const readinessScore = readiness?.career_readiness_score !== undefined
    ? Math.round(readiness.career_readiness_score)
    : Math.min(100, Math.round(progressPct * 0.6 + (skills.length > 0 ? (skills.reduce((a, b) => a + b.score, 0) / skills.length) * 0.4 : 20)));

  return (
    <AppShell
      pageTitle={`Welcome back, ${user?.display_name || 'Learner'}`}
      pageSubtitle="Your continuous learning path is calibrated from live diagnostic evidence and industry requirements."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
            title="Refresh Progression"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <Link href="/careers">
            <Button variant="secondary" size="sm">
              Change Track
            </Button>
          </Link>
          <Link href={`/assessment/${roadmap?.career_id || 'data-scientist'}`}>
            <Button variant="primary" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Diagnostic Quiz
            </Button>
          </Link>
        </div>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="space-y-6">
            <SkeletonCard />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Anchor: Career Goal & Readiness Score Banner */}
          <div className="surface-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#007AFF]">
                Target Role
              </div>
              <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {readiness?.career_name || roadmap?.career_name || user?.profile?.target_career_name || 'Data Scientist'}
              </h2>
              <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] max-w-md">

                Industry validated roadmap • Multi-factor diagnostic calibration
              </p>
            </div>

            <div className="flex items-center gap-6 sm:pl-6 sm:border-l sm:border-[#E5E5EA] dark:sm:border-[#2C2C2E]">
              <div className="space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Career Readiness
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                    {readinessScore}%
                  </span>
                  <span className="text-xs font-semibold text-[#34C759]">
                    {readinessScore >= 70 ? 'On Track' : 'Calibrating'}
                  </span>
                </div>
              </div>

              {readiness?.confidence_score !== undefined && (
                <div className="space-y-1 pl-4 border-l border-[#E5E5EA] dark:border-[#2C2C2E] hidden md:block">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
                    Evidence Confidence
                  </div>
                  <div className="text-base font-bold text-[#6E6E73] dark:text-[#AEAEB2]">
                    {Math.round(readiness.confidence_score * 100)}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phase 8: Adaptive Evolution Banner */}
          {adaptiveState?.recent_adaptations && adaptiveState.recent_adaptations.length > 0 && (
            <AdaptationBanner
              recentEvents={adaptiveState.recent_adaptations}
              estimatedPace={adaptiveState.estimated_learning_pace}
              velocityRatio={adaptiveState.pace_velocity_ratio}
            />
          )}

          {/* Core Decision Anchor: Next Best Action */}
          <NextBestAction
            milestone={activeMilestone}
            careerName={readiness?.career_name || roadmap?.career_name || 'Target Track'}
            onComplete={handleCompleteMilestone}
            loading={completingId === activeMilestone?.id}
          />

          {/* 2-Column Progression Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Active Roadmap & Gaps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Roadmap Stages Snippet */}
              <div className="surface-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Milestone className="w-4 h-4 text-[#007AFF]" />
                    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                      Active Roadmap Progression
                    </h3>
                  </div>
                  <Link
                    href="/roadmap"
                    className="text-xs font-medium text-[#007AFF] hover:text-[#006EDB] flex items-center gap-1 transition-colors"
                  >
                    <span>View Roadmap</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {roadmap?.milestones && roadmap.milestones.length > 0 ? (
                  <div className="space-y-2">
                    {roadmap.milestones.slice(0, 4).map((m) => {
                      const isCompleted = m.status === 'completed';
                      const isAvailable = m.status === 'available';

                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isAvailable
                              ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/10 border-[#007AFF]/30'
                              : isCompleted
                              ? 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] opacity-80'
                              : 'bg-[#F5F5F7] dark:bg-[#1C1C1E] border-[#E5E5EA] dark:border-[#2C2C2E] opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                isCompleted
                                  ? 'bg-[#EAF8EE] text-[#34C759] border border-[#34C759]/20'
                                  : isAvailable
                                  ? 'bg-[#007AFF] text-white'
                                  : 'bg-[#E5E5EA] text-[#86868B]'
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : m.step_order}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">
                                {m.category}
                              </span>
                              <h4 className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate">{m.skill_name}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isAvailable && (
                              <button
                                onClick={() => handleCompleteMilestone(m.id)}
                                disabled={completingId === m.id}
                                className="px-2.5 py-1 rounded-md bg-[#007AFF] hover:bg-[#006EDB] text-white text-xs font-medium transition-colors cursor-pointer"
                              >
                                {completingId === m.id ? 'Saving...' : 'Mark Done'}
                              </button>
                            )}
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded uppercase ${
                                isCompleted
                                  ? 'bg-[#EAF8EE] text-[#34C759]'
                                  : isAvailable
                                  ? 'bg-[#EAF3FF] text-[#007AFF]'
                                  : 'bg-[#F5F5F7] text-[#86868B]'
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mb-2">No active learning path calibrated.</p>
                    <Link href="/careers">
                      <Button variant="primary" size="sm">
                        Select Career Track
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Identified High-Impact Skill Gaps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#FF9F0A]" />
                    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">High-Impact Skill Gaps</h3>
                  </div>
                  <Link
                    href="/skills"
                    className="text-xs font-medium text-[#007AFF] hover:text-[#006EDB] flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect Skill Graph</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {weakSkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {weakSkills.slice(0, 4).map((sk) => (
                      <SkillGapCard
                        key={sk.skill_slug}
                        skillName={sk.skill_name}
                        category={sk.category}
                        currentScore={Math.round(sk.current_proficiency * 100)}
                        targetScore={Math.round(sk.target_proficiency * 100)}
                        gapDelta={Math.round(sk.gap_magnitude * 100)}
                        priority={sk.suggested_priority === 'high' ? 'High' : 'Medium'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="surface-card rounded-xl p-5 text-center text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
                    {skills.length > 0
                      ? 'All evaluated competencies meet target industry benchmarks.'
                      : 'Take a diagnostic assessment to identify your prioritized skill gaps.'}
                  </div>
                )}
              </div>

              {/* Adaptive Mutation History */}
              <AdaptationTimeline events={adaptiveState?.recent_adaptations || []} />
            </div>

            {/* Right Column: Progress Metrics & Navigation Shortcuts */}
            <div className="space-y-6">
              <ProgressSummary
                progressPct={progressPct}
                completedMilestones={completedCount}
                totalMilestones={totalCount}
                xp={user?.profile?.xp || 0}
                streakDays={user?.profile?.streak_days || 1}
                estimatedHoursLeft={Math.max(1, totalCount * 3 - completedCount * 3)}
              />

              {/* AI Navigator Shortcut Card */}
              <div className="surface-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#007AFF] text-xs font-semibold">
                  <BrainCircuit className="w-4 h-4" />
                  <span>AI Learning Navigator</span>
                </div>
                <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] leading-relaxed">
                  Have questions about your prerequisite sequence or why a particular skill was recommended?
                </p>
                <Link href="/assistant" className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Ask AI Navigator</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#007AFF]" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
