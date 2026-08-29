'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { Career } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { CareerGoalCard } from '../../components/careers/CareerGoalCard';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function CareersPage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectingSlug, setSelectingSlug] = useState<string | null>(null);

  const fetchCareers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCareers();
      setCareers(data);
    } catch (err) {
      console.error('Failed to load careers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const categories = [
    'All',
    'Data & Analytics',
    'AI & Emerging Tech',
    'Software Engineering',
    'Cloud & Infrastructure',
    'Cybersecurity',
  ];

  const filteredCareers =
    selectedCategory === 'All'
      ? careers
      : careers.filter((c) =>
          c.category.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  const handleSelectTrack = async (careerSlug: string) => {
    setSelectingSlug(careerSlug);
    try {
      await apiClient.setTargetCareer(careerSlug);
      router.push(`/dashboard`);
    } catch (e) {
      console.error('Failed to set target career:', e);
      router.push(`/dashboard`);
    } finally {
      setSelectingSlug(null);
    }
  };

  return (
    <AppShell
      pageTitle="Target Career Tracks"
      pageSubtitle="Select a specialized engineering role to calibrate your diagnostic assessment and roadmap."
      actions={
        <button
          onClick={fetchCareers}
          className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition-colors"
          title="Refresh Careers"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Careers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map((career) => (
              <CareerGoalCard
                key={career.id}
                career={career}
                onSelectTrack={handleSelectTrack}
                loading={selectingSlug === career.slug}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
