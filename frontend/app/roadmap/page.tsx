'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Milestone, Compass, Sparkles, RefreshCw, CheckCircle2, ArrowRight, Layers, ShieldCheck, History } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { LearningPath, MilestoneItem, RoadmapVersion } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { RoadmapPhase } from '../../components/roadmap/RoadmapPhase';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [versions, setVersions] = useState<RoadmapVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const [roadmapData, versionsData] = await Promise.allSettled([
        apiClient.getRoadmap(),
        apiClient.getRoadmapVersions(),
      ]);
      if (roadmapData.status === 'fulfilled') setRoadmap(roadmapData.value);
      if (versionsData.status === 'fulfilled') setVersions(versionsData.value);
    } catch (e) {
      console.error('Failed to load roadmap:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleCompleteMilestone = async (milestoneId: string) => {
    setCompletingId(milestoneId);
    try {
      await apiClient.completeMilestone(milestoneId);
      await fetchRoadmap();
    } catch (err) {
      console.error('Error completing milestone:', err);
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
      setFeedbackMap((prev) => ({ ...prev, [milestoneId]: type }));
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  // Group milestones into Phased Stages (Foundations, Core, Applied, Capstone)
  const items = roadmap?.milestones || [];
  const phase1 = items.filter((m) => m.step_order <= 2);
  const phase2 = items.filter((m) => m.step_order >= 3 && m.step_order <= 5);
  const phase3 = items.filter((m) => m.step_order >= 6);

  const completedCount = items.filter((m) => m.status === 'completed').length;
  const totalCount = items.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <AppShell
      pageTitle="Personalized Learning Roadmap"
      pageSubtitle={`Sequential staircase milestone journey calibrated for ${roadmap?.career_name || 'Target Track'}`}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRoadmap}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition-colors"
            title="Refresh Roadmap"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/feedback">
            <Button variant="outline" size="sm">
              Adjust Pacing
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
      ) : roadmap && items.length > 0 ? (
        <div className="space-y-10">
          {/* Top Progress Overview */}
          <div className="glass-card-glow rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Active Track: {roadmap.career_name}</span>
                </div>
                {versions.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                    <History className="w-3.5 h-3.5" />
                    <span>Roadmap Version {versions[0].version_number}</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Roadmap Mastery: {progressPct}% Complete
              </h2>
              <p className="text-xs text-slate-300">
                {completedCount} of {totalCount} sequential milestones completed.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2">
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-brand-500 to-cyan-400 transition-all duration-700"
                  style={{ width: `${Math.max(progressPct, 5)}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 block text-right">
                {totalCount - completedCount} milestones remaining
              </span>
            </div>
          </div>

          {/* Phased Milestones Breakdown */}
          <div className="space-y-12">
            {phase1.length > 0 && (
              <RoadmapPhase
                phaseTitle="Phase 1: Foundations & Core Tooling"
                phaseDescription="Master primary programming syntax, essential relational querying, and environment setup."
                milestones={phase1}
                onComplete={handleCompleteMilestone}
                onFeedback={handleFeedback}
                loadingId={completingId}
                feedbackMap={feedbackMap}
              />
            )}

            {phase2.length > 0 && (
              <RoadmapPhase
                phaseTitle="Phase 2: Core Engineering & Algorithmic Foundations"
                phaseDescription="Applied mathematics, data manipulation pipelines, and core model architectures."
                milestones={phase2}
                onComplete={handleCompleteMilestone}
                onFeedback={handleFeedback}
                loadingId={completingId}
                feedbackMap={feedbackMap}
              />
            )}

            {phase3.length > 0 && (
              <RoadmapPhase
                phaseTitle="Phase 3: Applied Systems, Projects & Industry MLOps"
                phaseDescription="End-to-end production deployments, distributed architectures, and portfolio projects."
                milestones={phase3}
                onComplete={handleCompleteMilestone}
                onFeedback={handleFeedback}
                loadingId={completingId}
                feedbackMap={feedbackMap}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
          <Compass className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Roadmap Generated</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Take a diagnostic quiz for your selected career track to generate your personalized staircase path.
          </p>
          <Link href="/careers">
            <Button variant="glow" size="md">
              Browse Careers & Take Assessment
            </Button>
          </Link>
        </div>
      )}
    </AppShell>
  );
}
