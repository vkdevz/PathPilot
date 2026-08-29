'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Flame, Trophy, Clock, CheckCircle2, RefreshCw, PlusCircle, Sparkles } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { HeatmapDay, LearningPath, MilestoneItem } from '../../types';
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
      pageTitle="Learning Activity & Progress"
      pageSubtitle="Track your continuous study habits, 28-day activity heatmap, and verified completed milestones."
      actions={
        <button
          onClick={fetchProgressData}
          className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition-colors"
          title="Refresh Progress"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-panel rounded-3xl p-6 space-y-1">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Total XP Earned</span>
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-black text-white">{user?.profile?.xp || 150} XP</h3>
            <p className="text-[11px] text-slate-400">Calculated from PostgreSQL</p>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-1">
            <div className="flex items-center justify-between text-rose-400 mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Current Streak</span>
              <Flame className="w-4 h-4 fill-rose-400" />
            </div>
            <h3 className="text-2xl font-black text-white">{user?.profile?.streak_days || 3} Days</h3>
            <p className="text-[11px] text-slate-400">Consecutive study sessions</p>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-1">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Time Studied (28d)</span>
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-black text-white">{Math.round(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m</h3>
            <p className="text-[11px] text-slate-400">{totalStudyMinutes} recorded minutes</p>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Milestones Done</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-black text-white">{completedMilestones.length}/{totalMilestones}</h3>
            <p className="text-[11px] text-slate-400">Roadmap progress</p>
          </div>
        </div>

        {/* 28-Day Study Heatmap & Manual Logger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Heatmap (2 Cols) */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  28-Day Learning Activity Heatmap
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Past 4 Weeks</span>
            </div>

            {loading ? (
              <SkeletonCard />
            ) : heatmap.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {heatmap.map((day, idx) => {
                    const intensity = day.intensity || (day.minutes > 0 ? 1 : 0);
                    return (
                      <div
                        key={day.date || idx}
                        title={`${day.date}: ${day.minutes} minutes logged`}
                        className={`h-10 rounded-xl border flex flex-col items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                          day.minutes >= 60
                            ? 'bg-emerald-500/80 border-emerald-400 text-white shadow-glow-emerald'
                            : day.minutes >= 30
                            ? 'bg-emerald-600/50 border-emerald-500/50 text-white'
                            : day.minutes > 0
                            ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-600'
                        }`}
                      >
                        <span>{day.date ? day.date.slice(5) : `${idx + 1}`}</span>
                        {day.minutes > 0 && <span className="text-[9px] opacity-90">{day.minutes}m</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Less Active</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
                    <div className="w-3 h-3 rounded bg-indigo-600/30 border border-indigo-500/40" />
                    <div className="w-3 h-3 rounded bg-emerald-600/50 border border-emerald-500/50" />
                    <div className="w-3 h-3 rounded bg-emerald-500/80 border border-emerald-400" />
                  </div>
                  <span>High Activity (60m+)</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No study sessions logged yet.</p>
            )}
          </div>

          {/* Quick Study Logger Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Log Study Time</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manually record offline reading, coding practice, or project work to earn XP and build your streak.
            </p>

            <form onSubmit={handleManualLog} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Minutes Studied
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLogMinutes(m)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        logMinutes === m
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {m} Min
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="glow"
                size="md"
                type="submit"
                loading={logging}
                className="w-full"
                icon={<Sparkles className="w-4 h-4 text-amber-300" />}
              >
                Log Session & Earn +{Math.round(logMinutes * 1.5)} XP
              </Button>

              {logSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-semibold">
                  ✓ Activity recorded to PostgreSQL!
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Completed Milestones Audit Table */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Verified Completed Milestones
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {completedMilestones.length} Completed
            </span>
          </div>

          {completedMilestones.length > 0 ? (
            <div className="space-y-2">
              {completedMilestones.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Step {m.step_order} • {m.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{m.skill_name}</h4>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    +100 XP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              <p>No completed milestones yet. Complete items on your Roadmap to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
