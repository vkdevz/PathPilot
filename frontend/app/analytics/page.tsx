'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import { BarChart3, Trophy, Medal, Sparkles, RefreshCw, Flame, Users, Activity } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { LearnerSkill, LeaderboardUser, HeatmapDay } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function AnalyticsPage() {
  const [skills, setSkills] = useState<LearnerSkill[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [skillsData, leaderData, heatData] = await Promise.allSettled([
        apiClient.getMySkills(),
        apiClient.getLeaderboard(),
        apiClient.getHeatmap(28),
      ]);

      if (skillsData.status === 'fulfilled') setSkills(skillsData.value);
      if (leaderData.status === 'fulfilled') setLeaderboard(leaderData.value);
      if (heatData.status === 'fulfilled') setHeatmap(heatData.value);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const chartData = skills.map((s) => ({
    name: s.skill_name.length > 15 ? `${s.skill_name.slice(0, 14)}…` : s.skill_name,
    fullName: s.skill_name,
    score: s.score,
    target: 85,
    category: s.category,
  }));

  const totalStudyMinutes = heatmap.reduce((acc, curr) => acc + (curr.minutes || 0), 0);

  return (
    <AppShell
      pageTitle="Analytics & Guild Leaderboard"
      pageSubtitle="Comprehensive competency benchmarks and live community leaderboard calculated from PostgreSQL learner XP."
      actions={
        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition-colors"
          title="Refresh Analytics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel rounded-3xl p-6 space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400">Assessed Competencies</span>
            <h3 className="text-2xl font-black text-white">{skills.length} Skills</h3>
            <p className="text-[11px] text-slate-400">Calculated across diagnostic quizzes</p>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400">Average Proficiency</span>
            <h3 className="text-2xl font-black text-indigo-300">
              {skills.length > 0
                ? Math.round(skills.reduce((acc, s) => acc + s.score, 0) / skills.length)
                : 0}
              %
            </h3>
            <p className="text-[11px] text-slate-400">Target Benchmark: 85%</p>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400">Community Rank</span>
            <h3 className="text-2xl font-black text-amber-300">
              #{leaderboard.find((u) => u.is_current)?.rank || 1}
            </h3>
            <p className="text-[11px] text-slate-400">Based on verified completed milestones</p>
          </div>
        </div>

        {/* 2-Column Analytics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recharts Skill Progression Chart (2 Cols) */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Competency Score vs Industry Benchmark (85%)
                </h3>
              </div>
            </div>

            {loading ? (
              <SkeletonCard />
            ) : chartData.length > 0 ? (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: number) => [`${val}% Score`, 'Proficiency']}
                      labelFormatter={(label) => `Topic: ${label}`}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.score >= 85
                              ? '#10b981'
                              : entry.score >= 70
                              ? '#6366f1'
                              : '#f59e0b'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400">
                <p>No skill assessment scores available to graph.</p>
                <Link href="/careers" className="mt-3 inline-block font-semibold text-indigo-400">
                  Take Diagnostic Assessment →
                </Link>
              </div>
            )}
          </div>

          {/* Guild Community Leaderboard */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Guild Leaderboard</h3>
              </div>
              <Users className="w-4 h-4 text-slate-400" />
            </div>

            {loading ? (
              <SkeletonCard />
            ) : (
              <div className="space-y-2.5">
                {leaderboard.map((u) => {
                  const isTop3 = u.rank <= 3;
                  return (
                    <div
                      key={u.user_id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        u.is_current
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-glow-indigo'
                          : 'bg-slate-950/60 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                            u.rank === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : u.rank === 2
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30'
                              : u.rank === 3
                              ? 'bg-amber-700/20 text-amber-400 border border-amber-600/30'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {u.rank}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.is_current && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-extrabold">
                                YOU
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-slate-400 block truncate">{u.career}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-amber-400 block">{u.xp} XP</span>
                        <span className="text-[10px] text-rose-400 font-semibold">{u.streak}d streak</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
