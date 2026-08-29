'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Zap,
  Flame,
  Trophy,
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import type { LearningPath, MilestoneItem, Career } from '../../types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [careersData, roadmapData] = await Promise.allSettled([
        apiClient.getCareers(),
        apiClient.getRoadmap()
      ]);

      if (careersData.status === 'fulfilled') {
        setCareers(careersData.value);
      }
      if (roadmapData.status === 'fulfilled') {
        setRoadmap(roadmapData.value);
      } else {
        setRoadmap(null);
      }
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

  const handleFeedback = async (milestoneId: string, type: string) => {
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

  const activeMilestone = roadmap?.milestones?.find((m) => m.status === 'available') || roadmap?.milestones?.[0];
  const completedCount = roadmap?.milestones?.filter((m) => m.status === 'completed').length || 0;
  const totalCount = roadmap?.milestones?.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">PathPilot AI</span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/dashboard"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              >
                Dashboard
              </Link>
              <Link
                href="/careers"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Careers
              </Link>
              <Link
                href="/leaderboard"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Leaderboard
              </Link>
              <Link
                href="/analytics"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Analytics
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats pills */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{user?.profile?.xp || 150} XP</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span>{user?.profile?.streak_days || 3}d</span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/60 border border-indigo-500/30 p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Active Track: {roadmap?.career_name || 'Data Scientist'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.display_name || 'Learner'}!
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                You are on track to master modern industry engineering skills. Complete today's milestone to keep your streak alive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/careers"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
              >
                Change Career Track
              </Link>
              <Link
                href={`/assessment/${roadmap?.career_id || 'data-scientist'}`}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Diagnostic Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quest & Progression Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Today's Quest Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-indigo-400" />
                  <span>Today's Milestone Quest</span>
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold uppercase">
                  {activeMilestone?.status || 'Active'}
                </span>
              </div>

              {activeMilestone ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                      {activeMilestone.category}
                    </span>
                    <h3 className="text-lg font-bold text-white">{activeMilestone.skill_name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {activeMilestone.recommendation_reason || 'Core progressive skill in your personalized learning path.'}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                      <span>⏱️ ~{activeMilestone.estimated_hours} Hours</span>
                      <span>🎯 +100 XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCompleteMilestone(activeMilestone.id)}
                    disabled={completingId === activeMilestone.id || activeMilestone.status === 'completed'}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completingId === activeMilestone.id
                        ? 'Unlocking next milestone...'
                        : activeMilestone.status === 'completed'
                        ? 'Milestone Completed!'
                        : 'Complete Quest & Unlock Next'}
                    </span>
                  </button>

                  {/* Feedback widget */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <p className="text-[11px] uppercase font-semibold text-slate-500 text-center mb-2">
                      Was this milestone appropriate?
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleFeedback(activeMilestone.id, 'too_easy')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          feedbackSent[activeMilestone.id] === 'too_easy'
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        ⚡ Too Easy (Skip)
                      </button>
                      <button
                        onClick={() => handleFeedback(activeMilestone.id, 'too_hard')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          feedbackSent[activeMilestone.id] === 'too_hard'
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        📚 Too Hard (More Practice)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400 mb-4">No active learning path found.</p>
                  <Link
                    href="/careers"
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Select a Track to Begin
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Roadmap Completion</span>
                <span className="font-bold text-white">{progressPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 pt-1">
                <span>{completedCount} Completed</span>
                <span>{totalCount} Total Milestones</span>
              </div>
            </div>
          </div>

          {/* Right Column: Staircase Roadmap Milestones */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    <span>Personalized Staircase Roadmap</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Step-by-step milestones unlocked sequentially based on your competencies
                  </p>
                </div>
                <button
                  onClick={() => loadDashboardData()}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {roadmap?.milestones && roadmap.milestones.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                  {roadmap.milestones.map((m, idx) => {
                    const isCompleted = m.status === 'completed';
                    const isAvailable = m.status === 'available';
                    const isLocked = m.status === 'locked';

                    return (
                      <div
                        key={m.id}
                        className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                          isAvailable
                            ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/50'
                            : isCompleted
                            ? 'bg-slate-900/40 border-slate-800/80 opacity-90'
                            : 'bg-slate-950/40 border-slate-900 opacity-60'
                        }`}
                      >
                        {/* Step Icon */}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border z-10 ${
                            isCompleted
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : isAvailable
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 animate-pulse'
                              : 'bg-slate-900 border-slate-800 text-slate-600'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : isAvailable ? (
                            <Play className="w-5 h-5 fill-white text-white" />
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                        </div>

                        {/* Step Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                              Step {m.step_order} • {m.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : isAvailable
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white mt-0.5">{m.skill_name}</h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {m.recommendation_reason || 'Foundational prerequisite milestone.'}
                          </p>

                          {isAvailable && (
                            <div className="mt-3 flex items-center gap-3">
                              <button
                                onClick={() => handleCompleteMilestone(m.id)}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                              >
                                Mark Step as Completed
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No Roadmap Generated Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                    Take the diagnostic skill quest to let the AI calibrate and generate your personalized staircase roadmap.
                  </p>
                  <Link
                    href="/careers"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                  >
                    Select Career & Take Diagnostic
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
