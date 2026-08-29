'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Search, BookOpen } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { Recommendation } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { RecommendationCard } from '../../components/recommendations/RecommendationCard';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getRecommendations();
      setRecommendations(data);
    } catch (e) {
      console.error('Failed to load recommendations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleLogStudy = async (resourceId: string, minutes: number) => {
    await apiClient.logProgress(resourceId, minutes);
  };

  const types = ['All', 'course', 'project', 'practice'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = recommendations.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skills_taught.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedType === 'All' || r.resource_type?.toLowerCase() === selectedType.toLowerCase();

    const matchesDiff =
      selectedDifficulty === 'All' || r.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

    return matchesSearch && matchesType && matchesDiff;
  });

  return (
    <AppShell
      pageTitle="Learning Recommendations"
      pageSubtitle="Curated courses, real-world projects, and hands-on labs with explainable matching criteria."
      actions={
        <button
          onClick={fetchRecommendations}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
          title="Refresh Recommendations"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Controls */}
        <div className="surface-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by skill, topic, or keyword (e.g. PyTorch, SQL, RAG)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-white/[0.06]">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wide transition-all ${
                    selectedType === t
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter recommendations by difficulty"
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {difficulties.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  {d === 'All' ? 'All Difficulties' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((r) => (
              <RecommendationCard
                key={r.resource_id}
                recommendation={r}
                onLogStudy={handleLogStudy}
              />
            ))}
          </div>
        ) : (
          <div className="surface-card rounded-2xl p-10 text-center text-xs text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-1" />
            <p>No resources found matching your search and filter criteria.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
