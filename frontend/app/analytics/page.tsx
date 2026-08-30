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
import { BarChart3, Trophy, RefreshCw, Users } from 'lucide-react';
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

  return (
    <AppShell
      pageTitle="Analytics & Leaderboard"
      pageSubtitle="Comprehensive competency benchmarks and live community leaderboard calculated from PostgreSQL learner XP."
      actions={
        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors cursor-pointer"
          title="Refresh Analytics"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold uppercase text-[#86868B]">Assessed Competencies</span>
            <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{skills.length} Skills</h3>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">Calculated across diagnostic quizzes</p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold uppercase text-[#86868B]">Average Proficiency</span>
            <h3 className="text-2xl font-bold text-[#007AFF]">
              {skills.length > 0
                ? Math.round(skills.reduce((acc, s) => acc + s.score, 0) / skills.length)
                : 0}
              %
            </h3>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">Target Benchmark: 85%</p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold uppercase text-[#86868B]">Community Rank</span>
            <h3 className="text-2xl font-bold text-[#FF9F0A]">
              #{leaderboard.find((u) => u.is_current)?.rank || 1}
            </h3>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">Based on verified completed milestones</p>
          </div>
        </div>

        {/* 2-Column Analytics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Skill Progression Chart (2 Cols) */}
          <div className="lg:col-span-2 surface-card rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                    <XAxis
                      dataKey="name"
                      stroke="#86868B"
                      fontSize={11}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#86868B" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E5EA',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#1D1D1F',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                      formatter={(val: number) => [`${val}% Score`, 'Proficiency']}
                      labelFormatter={(label) => `Topic: ${label}`}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.score >= 85
                              ? '#34C759'
                              : entry.score >= 70
                              ? '#007AFF'
                              : '#FF9F0A'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
                <p>No skill assessment scores available to graph.</p>
                <Link href="/careers" className="mt-3 inline-block font-semibold text-[#007AFF]">
                  Take Diagnostic Assessment →
                </Link>
              </div>
            )}
          </div>

          {/* Guild Community Leaderboard */}
          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FF9F0A]" />
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">Guild Leaderboard</h3>
              </div>
              <Users className="w-4 h-4 text-[#86868B]" />
            </div>

            {loading ? (
              <SkeletonCard />
            ) : (
              <div className="space-y-2">
                {leaderboard.map((u) => (
                  <div
                    key={u.user_id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      u.is_current
                        ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border-[#007AFF]'
                        : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                          u.rank === 1
                            ? 'bg-[#FF9F0A] text-white'
                            : u.rank === 2
                            ? 'bg-[#86868B] text-white'
                            : u.rank === 3
                            ? 'bg-[#007AFF] text-white'
                            : 'bg-[#F5F5F7] text-[#86868B]'
                        }`}
                      >
                        {u.rank}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.is_current && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#007AFF] text-white font-bold">
                              YOU
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-[#6E6E73] dark:text-[#AEAEB2] block truncate">{u.career}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#FF9F0A] block">{u.xp} XP</span>
                      <span className="text-[10px] text-[#34C759] font-medium">{u.streak}d streak</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
