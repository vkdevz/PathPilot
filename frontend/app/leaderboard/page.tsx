'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Flame, Zap, Crown, RefreshCw } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { LeaderboardUser } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <AppShell
      pageTitle="Guild Community Leaderboard"
      pageSubtitle="Live standings calculated from PostgreSQL learner profile XP and verified streak consistency."
      actions={
        <button
          onClick={fetchLeaderboard}
          className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition-colors"
          title="Refresh Standings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <SkeletonCard />
        ) : (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.map((u) => {
                const isTop3 = u.rank <= 3;
                return (
                  <div
                    key={u.user_id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      u.is_current
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-glow-indigo'
                        : isTop3
                        ? 'bg-slate-950/60 border-slate-800/80'
                        : 'bg-slate-950/30 border-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          u.rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-glow-amber'
                            : u.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : u.rank === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {u.rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{u.name}</span>
                          {u.is_current && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{u.career}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <Zap className="w-4 h-4 fill-amber-400" />
                        <span>{u.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <Flame className="w-4 h-4 fill-rose-400" />
                        <span>{u.streak}d streak</span>
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
        )}
      </div>
    </AppShell>
  );
}
