'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Flame, Trophy, Clock, CheckCircle2, RefreshCw, PlusCircle } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { HeatmapDay, LearningPath } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function ProgressPage() {
  const { user } = useAuth();
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [logMinutes, setLogMinutes] = useState(30);
  const [logging, setLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const [heatData, roadData] = await Promise.allSettled([
        apiClient.getHeatmap(28),
        apiClient.getRoadmap(),
      ]);

      if (heatData.status === 'fulfilled') setHeatmap(heatData.value);
      if (roadData.status === 'fulfilled') setRoadmap(roadData.value);
    } catch (e) {
      console.error('Failed to load progress data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogging(true);
    try {
      await apiClient.logProgress('res-python-mastery', logMinutes);
      setLogSuccess(true);
      setTimeout(() => setLogSuccess(false), 3000);
      await fetchProgressData();
    } catch (err) {
      console.error('Error logging study:', err);
    } finally {
      setLogging(false);
    }
  };

  const completedMilestones = roadmap?.milestones?.filter((m) => m.status === 'completed') || [];
  const totalMilestones = roadmap?.milestones?.length || 1;
  const totalStudyMinutes = heatmap.reduce((acc, curr) => acc + (curr.minutes || 0), 0);

  return (
    <AppShell
      pageTitle="Learning Progress & Activity"
      pageSubtitle="Track continuous study habits, 28-day activity heatmap, and verified completed milestones."
      actions={
        <button
          onClick={fetchProgressData}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
          title="Refresh Progress"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="surface-card rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Total XP</span>
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-white">{user?.profile?.xp || 0} XP</h3>
            <p className="text-[10px] text-slate-500">Verified on PostgreSQL</p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-rose-400 mb-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Streak</span>
              <Flame className="w-4 h-4 fill-rose-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{user?.profile?.streak_days || 1} Days</h3>
            <p className="text-[10px] text-slate-500">Active study consistency</p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-indigo-400 mb-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400">28d Study Time</span>
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-white">{Math.round(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m</h3>
            <p className="text-[10px] text-slate-500">Total logged study hours</p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Milestones</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-white">{completedMilestones.length} / {totalMilestones}</h3>
            <p className="text-[10px] text-slate-500">Competencies verified</p>
          </div>
        </div>

        {/* 28-Day Heatmap Card */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">28-Day Study Heatmap</h3>
            </div>
            <span className="text-xs text-slate-400">
              {totalStudyMinutes} minutes logged across 4 weeks
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {heatmap.map((d) => {
              const mins = d.minutes || 0;
              let bg = 'bg-slate-950/80 border-white/[0.04] text-slate-600';
              if (mins >= 90) bg = 'bg-indigo-600 text-white border-indigo-500 font-semibold';
              else if (mins >= 45) bg = 'bg-indigo-700/80 text-indigo-100 border-indigo-600/50 font-medium';
              else if (mins > 0) bg = 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30';

              return (
                <div
                  key={d.date}
                  className={`p-2.5 rounded-xl border text-center transition-all ${bg}`}
                  title={`${d.date}: ${mins} minutes logged`}
                >
                  <div className="text-[10px] uppercase font-mono text-slate-400">{d.date.slice(-2)}</div>
                  <div className="text-xs mt-1">{mins > 0 ? `${mins}m` : '—'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log Study Session Form */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>Log Study Session</span>
            </h3>
            {logSuccess && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> +50 XP Awarded!
              </span>
            )}
          </div>

          <form onSubmit={handleManualLog} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full flex items-center gap-3 p-2 bg-slate-950/80 rounded-xl border border-white/[0.08]">
              <Clock className="w-4 h-4 text-slate-500 ml-2" />
              <input
                type="number"
                min={5}
                max={300}
                step={5}
                value={logMinutes}
                onChange={(e) => setLogMinutes(Number(e.target.value))}
                className="bg-transparent text-xs text-white focus:outline-none w-20 font-bold"
              />
              <span className="text-xs text-slate-400">minutes of focused learning</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={logging}
              className="w-full sm:w-auto shrink-0"
            >
              Record Study Session
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
