'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, RefreshCw, Search, Filter, BookOpen, Code2, Video, Layers } from 'lucide-react';
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
      pageTitle="Personalized Resource Recommendations"
      pageSubtitle="Curated courses, real-world projects, and hands-on labs with explainable matching criteria."
      actions={
        <button
          onClick={fetchRecommendations}
          className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition-colors"
          title="Refresh Recommendations"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="glass-panel rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resources by title, topic, or skill (e.g. PyTorch, SQL, RAG)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedType === t
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedDifficulty === d
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onLogStudy={handleLogStudy}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center text-xs text-slate-400">
            <p>No resources found matching your current filter criteria.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
