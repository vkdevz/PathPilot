'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, Calendar, Zap, Clock, Activity, Award } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { HeatmapDay } from '../../types';

export default function AnalyticsPage() {
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getHeatmap(28)
      .then((data) => setHeatmap(data))
      .catch((err) => console.error('Failed to load heatmap:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalMinutes = heatmap.reduce((acc, curr) => acc + curr.minutes, 0);
  const activeDays = heatmap.filter((d) => d.minutes > 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">PathPilot AI</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
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
              href="/analytics"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
            >
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Page */}
      <main className="max-w-4xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Study Analytics & Activity</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time activity logs and streak consistency recorded directly in PostgreSQL.
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white">{totalMinutes} mins</span>
            <span className="block text-xs text-slate-400 mt-0.5">Total Study Time (28d)</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white">{activeDays} / 28</span>
            <span className="block text-xs text-slate-400 mt-0.5">Active Study Days</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white">
              {activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0} mins
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">Avg Session Duration</span>
          </div>
        </div>

        {/* 28-Day Heatmap Card */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>28-Day Consistency Heatmap</span>
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded bg-indigo-900" />
              <span className="w-2.5 h-2.5 rounded bg-indigo-600" />
              <span className="w-2.5 h-2.5 rounded bg-indigo-400" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
            {heatmap.map((day) => {
              const bgClass =
                day.intensity === 3
                  ? 'bg-indigo-400 text-slate-950 font-bold'
                  : day.intensity === 2
                  ? 'bg-indigo-600 text-white'
                  : day.intensity === 1
                  ? 'bg-indigo-900/80 text-indigo-200'
                  : 'bg-slate-800/60 text-slate-500';

              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.minutes} minutes`}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] transition-transform hover:scale-110 cursor-pointer ${bgClass}`}
                >
                  <span>{day.date.slice(-2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
