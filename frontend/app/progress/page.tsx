'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Flame,
  Trophy,
  Clock,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  BookOpen,
  Code2,
  Sparkles,
  FileText,
  ExternalLink,
  Award,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { HeatmapDay, LearningPath } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function ProgressPage() {
  const { user, refreshUser } = useAuth();
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [completedList, setCompletedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logMinutes, setLogMinutes] = useState(30);
  const [logging, setLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const [heatData, roadData, completedData] = await Promise.allSettled([
        apiClient.getHeatmap(28),
        apiClient.getRoadmap(),
        apiClient.getCompletedProgress(50),
      ]);

      if (heatData.status === 'fulfilled') setHeatmap(heatData.value);
      if (roadData.status === 'fulfilled') setRoadmap(roadData.value);
      if (completedData.status === 'fulfilled') setCompletedList(completedData.value);
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
      // LIVE XP REFRESH: Immediately refresh user context and progress data
      await refreshUser();
      await fetchProgressData();
    } catch (err) {
      console.error('Error logging study:', err);
    } finally {
      setLogging(false);
    }
  };

  const getFormatIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'project':
        return <Code2 className="w-4 h-4 text-[#007AFF]" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-[#007AFF]" />;
      case 'practice':
      case 'lab':
        return <Sparkles className="w-4 h-4 text-[#FF9F0A]" />;
      default:
        return <FileText className="w-4 h-4 text-[#86868B]" />;
    }
  };

  const completedMilestones = roadmap?.milestones?.filter((m) => m.status === 'completed') || [];
  const totalMilestones = roadmap?.milestones?.length || 1;
  const totalStudyMinutes = heatmap.reduce((acc, curr) => acc + (curr.minutes || 0), 0);

  return (
    <AppShell
      pageTitle="Learning Progress & Activity"
      pageSubtitle="Track continuous study habits, 28-day activity heatmap, and verified completed learning history."
      actions={
        <button
          onClick={fetchProgressData}
          className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors cursor-pointer"
          title="Refresh Progress"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[#FF9F0A] mb-1">
              <span className="text-[10px] font-semibold uppercase text-[#86868B]">Total XP</span>
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{user?.profile?.xp || 0} XP</h3>
            <p className="text-[10px] text-[#86868B]">Verified on PostgreSQL</p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[#34C759] mb-1">
              <span className="text-[10px] font-semibold uppercase text-[#86868B]">Streak</span>
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{user?.profile?.streak_days || 1} Days</h3>
            <p className="text-[10px] text-[#86868B]">Active study consistency</p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[#007AFF] mb-1">
              <span className="text-[10px] font-semibold uppercase text-[#86868B]">28d Study Time</span>
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
            </h3>
            <p className="text-[10px] text-[#86868B]">Total logged study hours</p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[#34C759] mb-1">
              <span className="text-[10px] font-semibold uppercase text-[#86868B]">Milestones</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {completedMilestones.length} / {totalMilestones}
            </h3>
            <p className="text-[10px] text-[#86868B]">Competencies verified</p>
          </div>
        </div>

        {/* 28-Day Heatmap Card */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#007AFF]" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">28-Day Study Heatmap</h3>
            </div>
            <span className="text-xs text-[#86868B]">
              {totalStudyMinutes} minutes logged across 4 weeks
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {heatmap.map((d) => {
              const mins = d.minutes || 0;
              let bg = 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#86868B]';
              if (mins >= 90) bg = 'bg-[#007AFF] text-white border-[#007AFF] font-semibold';
              else if (mins >= 45) bg = 'bg-[#EAF3FF] dark:bg-[#0A84FF]/25 text-[#007AFF] border-[#007AFF]/30 font-medium';
              else if (mins > 0) bg = 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] border-[#E5E5EA]';

              return (
                <div
                  key={d.date}
                  className={`p-2.5 rounded-xl border text-center transition-all ${bg}`}
                  title={`${d.date}: ${mins} minutes logged`}
                >
                  <div className="text-[10px] uppercase font-mono text-[#86868B]">{d.date.slice(-2)}</div>
                  <div className="text-xs mt-1">{mins > 0 ? `${mins}m` : '—'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completed Learning History Table */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E5EA] dark:border-[#2C2C2E] pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#34C759]" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Completed Learning</h3>
            </div>
            <span className="text-xs text-[#86868B]">
              {completedList.length} verified completed {completedList.length === 1 ? 'activity' : 'activities'}
            </span>
          </div>

          {completedList.length > 0 ? (
            <div className="divide-y divide-[#E5E5EA] dark:divide-[#2C2C2E]">
              {completedList.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] shrink-0 mt-0.5">
                      {getFormatIcon(item.resource_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {item.resource_title}
                        </h4>
                        <Badge variant="primary" size="sm">{item.resource_type}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#86868B] mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.time_spent_minutes} min
                        </span>
                        <span className="text-[#34C759] font-medium">
                          +{item.xp_earned} XP
                        </span>
                        {item.completed_at && (
                          <span>
                            {new Date(item.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {item.skills_taught && item.skills_taught.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.skills_taught.map((sk: string) => (
                            <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-[#FBFBFD] dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#AEAEB2] border border-[#E5E5EA] dark:border-[#38383A]">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/resources/${item.resource_slug || item.resource_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:underline shrink-0 sm:self-center"
                  >
                    <span>Review Resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <BookOpen className="w-8 h-8 text-[#86868B] mx-auto opacity-50" />
              <p className="text-xs text-[#86868B]">No completed learning modules recorded yet.</p>
              <Link href="/recommendations" className="inline-block text-xs font-semibold text-[#007AFF] hover:underline">
                Explore recommended learning modules →
              </Link>
            </div>
          )}
        </div>

        {/* Log Study Session Form */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#007AFF]" />
              <span>Log Study Session</span>
            </h3>
            {logSuccess && (
              <span className="text-xs font-semibold text-[#34C759] flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> +{Math.max(20, Math.floor(logMinutes / 5) * 10)} XP Awarded!
              </span>
            )}
          </div>

          <form onSubmit={handleManualLog} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full flex items-center gap-3 p-2 bg-[#FBFBFD] dark:bg-[#2C2C2E] rounded-xl border border-[#E5E5EA] dark:border-[#38383A]">
              <Clock className="w-4 h-4 text-[#86868B] ml-2" />
              <input
                type="number"
                min={5}
                max={300}
                step={5}
                value={logMinutes}
                onChange={(e) => setLogMinutes(Number(e.target.value))}
                className="bg-transparent text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none w-20 font-bold"
              />
              <span className="text-xs text-[#6E6E73] dark:text-[#AEAEB2]">minutes of focused learning</span>
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

