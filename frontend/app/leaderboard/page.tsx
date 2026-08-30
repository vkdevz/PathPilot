'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Zap, RefreshCw } from 'lucide-react';
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
          className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors cursor-pointer"
          title="Refresh Standings"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <SkeletonCard />
        ) : (
          <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            {leaderboard.length > 0 ? (
              leaderboard.map((u) => {
                const isTop3 = u.rank <= 3;
                return (
                  <div
                    key={u.user_id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      u.is_current
                        ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border-[#007AFF]'
                        : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          u.rank === 1
                            ? 'bg-[#FF9F0A] text-white shadow-sm'
                            : u.rank === 2
                            ? 'bg-[#86868B] text-white'
                            : u.rank === 3
                            ? 'bg-[#007AFF] text-white'
                            : 'bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868B] border border-[#E5E5EA] dark:border-[#38383A]'
                        }`}
                      >
                        {u.rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">{u.name}</span>
                          {u.is_current && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF] text-white font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#6E6E73] dark:text-[#AEAEB2]">{u.career}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-[#FF9F0A]">
                        <Zap className="w-3.5 h-3.5 fill-[#FF9F0A]" />
                        <span>{u.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#34C759]">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{u.streak}d streak</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-[#86868B]">
                Leaderboard will populate as learners earn XP in PostgreSQL.
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
