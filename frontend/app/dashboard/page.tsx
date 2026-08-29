'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Zap,
  Flame,
  Play,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  Milestone,
  RefreshCw,
  Target,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import type { LearningPath, MilestoneItem, Career, LearnerSkill, LearnerAdaptiveState } from '../../types';
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
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [careersRes, roadmapRes, skillsRes, adaptiveRes] = await Promise.allSettled([
        apiClient.getCareers(),
        apiClient.getRoadmap(),
        apiClient.getMySkills(),
        apiClient.getAdaptiveState(),
      ]);

      if (careersRes.status === 'fulfilled') setCareers(careersRes.value);
      if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value);
      else setRoadmap(null);
      if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value);
      if (adaptiveRes.status === 'fulfilled') setAdaptiveState(adaptiveRes.value);
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

  const handleFeedback = async (milestoneId: string, type: 'too_easy' | 'too_hard') => {
    try {
      await apiClient.submitFeedback({
        feedback_type: type,
        learning_path_item_id: milestoneId,
      });
      setFeedbackSent((prev) => ({ ...prev, [milestoneId]: type }));
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const activeMilestone =
    roadmap?.milestones?.find((m) => m.status === 'available') ||
    roadmap?.milestones?.find((m) => m.status === 'in_progress') ||
    roadmap?.milestones?.[0];

  const completedCount = roadmap?.milestones?.filter((m) => m.status === 'completed').length || 0;
  const totalCount = roadmap?.milestones?.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  // Derive skill gaps (skills with score < 75%)
  const weakSkills = skills.filter((s) => s.score < 75);
  const strongSkills = skills.filter((s) => s.score >= 75);

  return (
    <AppShell
      pageTitle={`Welcome back, ${user?.display_name || 'Learner'}!`}
      pageSubtitle="Your personalized path is calibrated based on real diagnostic scores and industry benchmarks."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition-colors"
            title="Refresh Progression"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/careers">
            <Button variant="outline" size="sm">
              Change Track
            </Button>
          </Link>
          <Link href={`/assessment/${roadmap?.career_id || 'data-scientist'}`}>
            <Button variant="glow" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
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
        <div className="space-y-8">
          {/* Phase 8: Adaptive Learning Banner & XAI Modal */}
          {adaptiveState?.recent_adaptations && adaptiveState.recent_adaptations.length > 0 && (
            <AdaptationBanner
              recentEvents={adaptiveState.recent_adaptations}
              estimatedPace={adaptiveState.estimated_learning_pace}
              velocityRatio={adaptiveState.pace_velocity_ratio}
            />
          )}

          {/* Hero: Next Best Action (Answers: "What should I do next and why?") */}
          <NextBestAction
            milestone={activeMilestone}
            careerName={roadmap?.career_name || 'Target Engineering Track'}
            onComplete={handleCompleteMilestone}
            loading={completingId === activeMilestone?.id}
          />

          {/* 2-Column Progression Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Milestones & Skill Gaps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Career Track Milestone Roadmap Snippet */}
              <div className="glass-panel rounded-3xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Milestone className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Active Staircase Milestones
                    </h3>
                  </div>
                  <Link
                    href="/roadmap"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>View Full Roadmap</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {roadmap?.milestones && roadmap.milestones.length > 0 ? (
                  <div className="space-y-3">
                    {roadmap.milestones.slice(0, 4).map((m) => {
                      const isCompleted = m.status === 'completed';
                      const isAvailable = m.status === 'available';

                      return (
                        <div
                          key={m.id}
                          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                            isAvailable
                              ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/40'
                              : isCompleted
                              ? 'glass-panel opacity-80'
                              : 'bg-slate-950/30 border-slate-900 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : isAvailable
                                  ? 'bg-indigo-600 text-white animate-pulse-subtle'
                                  : 'bg-slate-900 text-slate-600'
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : m.step_order}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {m.category}
                              </span>
                              <h4 className="text-xs font-bold text-white truncate">{m.skill_name}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isAvailable && (
                              <button
                                onClick={() => handleCompleteMilestone(m.id)}
                                disabled={completingId === m.id}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                              >
                                {completingId === m.id ? 'Unlocking...' : 'Mark Done'}
                              </button>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isCompleted
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : isAvailable
                                  ? 'bg-indigo-500/15 text-indigo-300'
                                  : 'bg-slate-800 text-slate-500'
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
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400 mb-3">No active learning roadmap calibrated.</p>
                    <Link href="/careers">
                      <Button variant="primary" size="sm">
                        Select Career Track
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Identified Top Skill Gaps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white">Top Identified Skill Gaps</h3>
                  </div>
                  <Link
                    href="/skills"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Inspect Skill Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {weakSkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {weakSkills.slice(0, 4).map((sk) => (
                      <SkillGapCard
                        key={sk.id}
                        skillName={sk.skill_name}
                        category={sk.category}
                        currentScore={sk.score}
                        targetScore={85}
                        gapDelta={85 - sk.score}
                        priority={sk.score < 50 ? 'High' : 'Medium'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel rounded-2xl p-6 text-center text-xs text-slate-400">
                    <p>
                      {skills.length > 0
                        ? '🎉 Great job! All assessed skills meet or exceed standard industry proficiency.'
                        : 'No diagnostic skills recorded. Take a diagnostic assessment to identify your gaps.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Phase 8: Adaptive Progression Timeline */}
              <AdaptationTimeline events={adaptiveState?.recent_adaptations || []} />
            </div>

            {/* Right Column: Progress Summary & Quick Actions */}
            <div className="space-y-6">
              <ProgressSummary
                progressPct={progressPct}
                completedMilestones={completedCount}
                totalMilestones={totalCount}
                xp={user?.profile?.xp || 150}
                streakDays={user?.profile?.streak_days || 3}
                estimatedHoursLeft={totalCount * 2 - completedCount * 2}
              />

              {/* Career Goal Card Widget */}
              <div className="glass-panel rounded-3xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Target Track
                  </span>
                  <Link
                    href="/careers"
                    className="text-[11px] font-semibold text-slate-400 hover:text-white"
                  >
                    Switch
                  </Link>
                </div>
                <h4 className="text-base font-extrabold text-white">
                  {roadmap?.career_name || 'Data Scientist'}
                </h4>
                <p className="text-xs text-slate-400">
                  Target timeline: 6 Months • 10h/week pacing
                </p>
                <div className="pt-2">
                  <Link
                    href="/recommendations"
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Recommended Resources</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
