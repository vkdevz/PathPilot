'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, Trophy, Medal, Flame, Zap, Crown } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { LeaderboardUser } from '../../types';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getLeaderboard()
      .then((data) => setLeaderboard(data))
      .catch((err) => console.error('Failed to load leaderboard:', err))
      .finally(() => setLoading(false));
  }, []);

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
              href="/leaderboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
            >
              Leaderboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Page */}
      <main className="max-w-4xl mx-auto px-6 py-10 flex-1 w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
            <Trophy className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Guild Leaderboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Live rankings calculated from PostgreSQL learner profile XP and consecutive active study streaks.
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          {leaderboard.length > 0 ? (
            leaderboard.map((u) => {
              const isTop3 = u.rank <= 3;
              return (
                <div
                  key={u.user_id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    u.is_current
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/40'
                      : isTop3
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : 'bg-slate-950/30 border-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        u.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : u.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : u.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {u.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{u.name}</span>
                        {u.is_current && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{u.career}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Zap className="w-4 h-4 fill-amber-400" />
                      <span>{u.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-400">
                      <Flame className="w-4 h-4 fill-rose-400" />
                      <span>{u.streak}d</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              Leaderboard will populate as learners earn XP in PostgreSQL.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
