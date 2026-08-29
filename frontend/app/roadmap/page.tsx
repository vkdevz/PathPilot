'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Milestone, Compass, Sparkles, RefreshCw, History, ArrowRight } from 'lucide-react';
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

  const items = roadmap?.milestones || [];
  const phase1 = items.filter((m) => m.step_order <= 2);
  const phase2 = items.filter((m) => m.step_order >= 3 && m.step_order <= 5);
  const phase3 = items.filter((m) => m.step_order >= 6);

  const completedCount = items.filter((m) => m.status === 'completed').length;
  const totalCount = items.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <AppShell
      pageTitle="Learning Roadmap"
      pageSubtitle={`Sequential staircase milestone journey calibrated for ${roadmap?.career_name || 'Target Track'}`}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRoadmap}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            title="Refresh Roadmap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <Link href="/feedback">
            <Button variant="secondary" size="sm">
              Adjust Pacing
            </Button>
          </Link>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : roadmap && items.length > 0 ? (
        <div className="space-y-8">
          {/* Top Progress Overview */}
          <div className="surface-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/25">
                  {roadmap.career_name}
                </span>
                {versions.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-300 border border-white/[0.08]">
                    <History className="w-3 h-3 text-indigo-400" />
                    <span>v{versions[0].version_number}</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Roadmap Mastery: {progressPct}% Complete
              </h2>
              <p className="text-xs text-slate-400">
                {completedCount} of {totalCount} sequential milestones completed
              </p>
            </div>

            <div className="w-full sm:w-56 space-y-1.5">
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                  style={{ width: `${Math.max(progressPct, 4)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 block text-right font-medium">
                {totalCount - completedCount} milestones remaining
              </span>
            </div>
          </div>

          {/* Phased Milestones Breakdown */}
          <div className="space-y-8">
            {phase1.length > 0 && (
              <RoadmapPhase
                phaseTitle="Phase 1 • Foundations & Core Tooling"
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
                phaseTitle="Phase 2 • Algorithmic & Statistical Core"
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
                phaseTitle="Phase 3 • Applied Systems & Production Deployment"
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
        <div className="surface-card rounded-2xl p-10 text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Roadmap Generated</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Select a target career track to generate your personalized learning path.
          </p>
          <Link href="/careers" className="inline-block pt-1">
            <Button variant="primary" size="sm">
              Select Career Track
            </Button>
          </Link>
        </div>
      )}
    </AppShell>
  );
}
