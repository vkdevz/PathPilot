import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../services/api';
import { LeaderboardUser } from '../types';
import { Trophy, Flame, Award, Medal, Sparkles } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [filter, setFilter] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchLeaderboard();
      setLeaderboard(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-600 border border-amber-300 flex items-center justify-center mx-auto mb-2 shadow-sm">
          <Trophy className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Guild Leaderboard 🏆
        </h1>
        <p className="text-slate-600 text-sm">
          Rankings of heroic learners advancing their personalized career paths.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {(['weekly', 'monthly', 'alltime'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-xl text-xs font-black capitalize transition-all ${
                filter === tab ? 'bg-brand-600 text-white shadow-glow-celestial' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'alltime' ? 'All Time' : `${tab}`}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-soft-lg bg-white">
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-12 text-xs font-black text-slate-500 uppercase tracking-wider">
          <span className="col-span-2 sm:col-span-1 text-center">Rank</span>
          <span className="col-span-6 sm:col-span-5">Learner Hero</span>
          <span className="col-span-4 sm:col-span-3">Career Track</span>
          <span className="hidden sm:block col-span-3 text-right">XP Points</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-brand-600">
            <Sparkles className="w-8 h-8 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaderboard.map((item) => {
              return (
                <div
                  key={item.rank}
                  className={`p-4 grid grid-cols-12 items-center text-sm transition-colors ${
                    item.is_current ? 'bg-brand-50/70 border-l-4 border-brand-600 font-extrabold' : 'hover:bg-slate-50'
                  }`}
                >
                  
                  {/* Rank Icon / Number */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center font-black">
                    {item.rank === 1 ? (
                      <span className="text-2xl">🥇</span>
                    ) : item.rank === 2 ? (
                      <span className="text-2xl">🥈</span>
                    ) : item.rank === 3 ? (
                      <span className="text-2xl">🥉</span>
                    ) : (
                      <span className="text-slate-500">#{item.rank}</span>
                    )}
                  </div>

                  {/* Learner Info */}
                  <div className="col-span-6 sm:col-span-5 flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center font-black text-brand-700 text-xs shrink-0 border border-brand-200">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                        <span>{item.name}</span>
                        {item.is_current && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-brand-600 text-white font-black">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-bold mt-0.5">
                        <span className="flex items-center space-x-0.5 text-amber-600">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{item.streak}d streak</span>
                        </span>
                        <span>•</span>
                        <span>{item.badges} Badges</span>
                      </div>
                    </div>
                  </div>

                  {/* Career Track */}
                  <div className="col-span-4 sm:col-span-3 text-xs text-slate-700 font-bold">
                    {item.career}
                  </div>

                  {/* XP Points */}
                  <div className="hidden sm:block col-span-3 text-right font-black text-brand-600 text-base">
                    {item.xp} XP
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
