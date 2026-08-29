'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, ArrowRight, Zap, TrendingUp, DollarSign, Check, Sparkles } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { Career } from '../../types';

export default function CareersPage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    apiClient
      .getCareers()
      .then((data) => setCareers(data))
      .catch((err) => console.error('Failed to load careers:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Data & Analytics', 'AI & Emerging Tech', 'Software Engineering', 'Cloud & Infrastructure', 'Cybersecurity'];

  const filteredCareers =
    selectedCategory === 'All'
      ? careers
      : careers.filter((c) => c.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleSelectTrack = async (careerSlug: string) => {
    try {
      await apiClient.setTargetCareer(careerSlug);
    } catch (e) {
      // Continue to assessment even if offline
    }
    router.push(`/assessment/${careerSlug}`);
  };

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
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
            >
              Careers
            </Link>
            <Link
              href="/leaderboard"
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Leaderboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Page */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>High-Growth Engineering Roles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Select Your Target Career Track
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Choose a target engineering specialization to calibrate your diagnostic quiz and generate your personalized staircase roadmap.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Career Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredCareers.map((career) => (
            <div
              key={career.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between group transition-all hover:shadow-indigo-950/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 inline-block">
                    {career.icon || '🎯'}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{career.market_demand_score}% Demand</span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  {career.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                  {career.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {career.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-slate-300">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{career.salary_range}</span>
                  </div>
                  <span>{career.total_skills || 6} Key Skills</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleSelectTrack(career.slug)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Diagnostic Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
