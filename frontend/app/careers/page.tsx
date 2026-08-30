'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, RefreshCw, Search, Sparkles } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { Career, LearningPath } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { CareerGoalCard } from '../../components/careers/CareerGoalCard';
import { SkeletonCard } from '../../components/ui/Skeleton';

import { useAuth } from '../../context/AuthContext';

export default function CareersPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectingSlug, setSelectingSlug] = useState<string | null>(null);

  const fetchCareersData = async () => {
    setLoading(true);
    try {
      const [careersData, roadmapData] = await Promise.allSettled([
        apiClient.getCareers(),
        apiClient.getRoadmap(),
      ]);
      if (careersData.status === 'fulfilled') setCareers(careersData.value);
      if (roadmapData.status === 'fulfilled') setRoadmap(roadmapData.value);
    } catch (e) {
      console.error('Failed to load careers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareersData();
  }, []);

  const handleSelectTrack = async (careerSlug: string) => {
    setSelectingSlug(careerSlug);
    try {
      await apiClient.setCareerGoal(careerSlug);
      await refreshUser();
      await fetchCareersData();
    } catch (err) {
      console.error('Failed to set career goal:', err);
    } finally {
      setSelectingSlug(null);
    }
  };


  const categories = ['All', 'Data & AI', 'Software Engineering', 'Cloud & Infrastructure', 'Security'];

  const filteredCareers = careers.filter((c) => {
    const matchesCategory =
      selectedCategory === 'All' || c.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AppShell
      pageTitle="Career Tracks & Industry Pathways"
      pageSubtitle="Select a target role to dynamically generate your prerequisite-aware roadmap and benchmark quizzes."
      actions={
        <button
          onClick={fetchCareersData}
          className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors cursor-pointer"
          title="Refresh Careers"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="surface-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search careers by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#007AFF] text-white font-semibold shadow-sm'
                    : 'text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredCareers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCareers.map((c) => (
              <CareerGoalCard
                key={c.id}
                career={c}
                isCurrent={roadmap?.career_name === c.name || roadmap?.career_id === c.id}
                onSelectTrack={handleSelectTrack}
                loading={selectingSlug === c.slug}
              />
            ))}
          </div>
        ) : (
          <div className="surface-card rounded-2xl p-10 text-center text-xs text-[#6E6E73] dark:text-[#AEAEB2] space-y-2">
            <Compass className="w-8 h-8 text-[#86868B] mx-auto mb-1" />
            <p>No career pathways found matching your search.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
