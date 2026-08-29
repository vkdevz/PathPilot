'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Clock,
  BookOpen,
  Target,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { Career } from '../../types';
import { Button } from '../../components/ui/Button';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>('data-scientist');
  const [experienceLevel, setExperienceLevel] = useState<string>('Beginner');
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [learningPreference, setLearningPreference] = useState<string>('hands_on_projects');
  const [naturalLanguageBio, setNaturalLanguageBio] = useState<string>(
    'I want to transition into an engineering role. I have basic Python syntax knowledge and want a structured roadmap.'
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.getCareers().then(setCareers).catch(console.error);
  }, []);

  const handleCompleteOnboarding = async () => {
    setSubmitting(true);
    try {
      // 1. Set target career
      await apiClient.setTargetCareer(selectedCareer);

      // 2. Update learner preferences
      await apiClient.updateProfile({
        experience_level: experienceLevel,
        weekly_hours_goal: weeklyHours,
        preferred_format: learningPreference,
        preferences: {
          bio: naturalLanguageBio,
          target_timeline_months: 6,
        },
      });

      // 3. Direct to diagnostic assessment for the selected career
      router.push(`/assessment/${selectedCareer}`);
    } catch (err) {
      console.error('Onboarding profile sync error:', err);
      router.push(`/assessment/${selectedCareer}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-glow-indigo">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">PathPilot 2.0</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <span>Step {step} of 3</span>
            <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Wizard Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        {/* Step 1: Career Goal */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Question 1: Where am I going?</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Select Your Target Career Track
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                PathPilot tailors your diagnostic tests, prerequisite graphs, and milestone steps to this role.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {careers.map((career) => {
                const isSelected = selectedCareer === career.slug;
                return (
                  <div
                    key={career.slug}
                    onClick={() => setSelectedCareer(career.slug)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-glow-indigo'
                        : 'glass-panel-interactive'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{career.icon || '🚀'}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{career.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{career.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-indigo-300 pt-2 border-t border-slate-800">
                      <span>{career.salary_range}</span>
                      <span className="text-emerald-400">{career.market_demand_score}% Demand</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="glow"
                size="lg"
                onClick={() => setStep(2)}
                icon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Continue to Experience & Background
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Experience & Bio */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Question 2: Where am I now?</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Your Baseline & Experience Level
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Help us calibrate the initial difficulty and skip topics you have already mastered.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {/* Level Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Current Technical Experience
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all ${
                        experienceLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Natural Language Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tell us about your background in natural language
                </label>
                <textarea
                  rows={3}
                  value={naturalLanguageBio}
                  onChange={(e) => setNaturalLanguageBio(e.target.value)}
                  placeholder="e.g. I know basic SQL and Python syntax, looking to learn MLOps and build production neural nets in 6 months."
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  💡 Natural language input is prepared for autonomous entity extraction in future phases.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <Button variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4 mr-1" />}>
                Back
              </Button>
              <Button variant="glow" onClick={() => setStep(3)} icon={<ArrowRight className="w-4 h-4 ml-1" />}>
                Continue to Pacing
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Weekly Hours & Preferences */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pacing & Learning Style</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Weekly Study Time & Format
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Customize your roadmap cadence to fit your real-world schedule.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {/* Slider */}
              <div className="glass-panel rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-300">Weekly Dedicated Study Commitment:</span>
                  <span className="text-indigo-400 text-base">{weeklyHours} Hours / Week</span>
                </div>

                <input
                  type="range"
                  min={2}
                  max={30}
                  step={2}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                  <span>2h (Casual)</span>
                  <span>10h (Balanced)</span>
                  <span>20h+ (Accelerated)</span>
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Preferred Learning Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'hands_on_projects', label: '🛠️ Interactive Labs & Projects' },
                    { id: 'video_courses', label: '📺 Structured Video Courses' },
                    { id: 'reading_docs', label: '📖 Documentation & Articles' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setLearningPreference(fmt.id)}
                      className={`p-4 rounded-2xl text-xs font-bold border text-left transition-all ${
                        learningPreference === fmt.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <Button variant="outline" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4 mr-1" />}>
                Back
              </Button>
              <Button
                variant="glow"
                size="lg"
                loading={submitting}
                onClick={handleCompleteOnboarding}
                icon={<Zap className="w-4 h-4 text-amber-300" />}
              >
                Complete Onboarding & Start Diagnostic
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
