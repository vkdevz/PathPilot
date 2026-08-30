'use client';

import React, { useEffect, useState } from 'react';
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
          className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors cursor-pointer"
          title="Refresh Recommendations"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Controls */}
        <div className="surface-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by skill, topic, or keyword (e.g. PyTorch, SQL, RAG)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A]">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wide transition-all cursor-pointer ${
                    selectedType === t
                      ? 'bg-[#007AFF] text-white font-semibold shadow-sm'
                      : 'text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
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
              className="px-3 py-1.5 rounded-lg bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#007AFF] cursor-pointer"
            >
              {difficulties.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7]">
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
          <div className="surface-card rounded-2xl p-10 text-center text-xs text-[#6E6E73] dark:text-[#AEAEB2] space-y-2">
            <BookOpen className="w-8 h-8 text-[#86868B] mx-auto mb-1" />
            <p>No resources found matching your search and filter criteria.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
