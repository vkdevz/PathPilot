'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
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
      if (Array.isArray(data) && data.length > 0) {
        setCareers(data);
      }
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
          (c.category || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes((c.category || '').toLowerCase())
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
      pageTitle="Engineering Career Tracks"
      pageSubtitle="Select a specialized engineering role to calibrate your diagnostic assessment and roadmap."
      actions={
        <button
          onClick={fetchCareers}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
          title="Refresh Careers"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-white/[0.06] w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Careers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
