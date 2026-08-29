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
  Zap,
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
    'I want to transition into an engineering role with structured guidance.'
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.getCareers().then(setCareers).catch(console.error);
  }, []);

  const handleCompleteOnboarding = async () => {
    setSubmitting(true);
    try {
      await apiClient.setTargetCareer(selectedCareer);
      await apiClient.updateProfile({
        experience_level: experienceLevel,
        weekly_hours_goal: weeklyHours,
        preferred_format: learningPreference,
        preferences: {
          bio: naturalLanguageBio,
          target_timeline_months: 6,
        },
      });
      router.push(`/assessment/${selectedCareer}`);
    } catch (err) {
      console.error('Onboarding profile sync error:', err);
      router.push(`/assessment/${selectedCareer}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen surface-base text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">PathPilot</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Step {step} of 3</span>
            <div className="w-20 h-1.5 rounded-full bg-slate-900 overflow-hidden border border-white/[0.06]">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-10 flex-1 w-full flex flex-col justify-center">
        {/* Step 1: Career Goal */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Question 1 • Target Direction
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Select Your Target Role
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                PathPilot calibrates your diagnostic questions and sequential milestones to this specialization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {careers.map((career) => {
                const isSelected = selectedCareer === career.slug;
                return (
                  <div
                    key={career.slug}
                    onClick={() => setSelectedCareer(career.slug)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-left ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50'
                        : 'surface-card hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{career.icon || '🎯'}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{career.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{career.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-400 pt-2 border-t border-white/[0.04]">
                      <span>{career.salary_range}</span>
                      <span className="text-emerald-400">{career.market_demand_score}% Demand</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(2)}
                icon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Continue to Baseline Experience
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Experience & Bio */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Question 2 • Current Baseline
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Your Background & Experience
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Helps determine the starting depth of your diagnostic evaluation.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Current Engineering Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        experienceLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow-sm'
                          : 'bg-slate-950 border-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Brief Background or Goal (Optional)
                </label>
                <textarea
                  rows={3}
                  value={naturalLanguageBio}
                  onChange={(e) => setNaturalLanguageBio(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Self-taught programmer with Python basics looking to build production models..."
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep(1)}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(3)}
                icon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Set Study Schedule
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Study Pacing & Format */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Question 3 • Calibration
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Study Pacing & Modality
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                We pace your milestones to fit your weekly schedule and format preferences.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">Target Weekly Study Commitment</span>
                  <span className="font-bold text-indigo-400 font-mono">{weeklyHours} Hours / Week</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={5}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Preferred Learning Modality
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'hands_on_projects', label: 'Hands-On Projects', icon: '🛠️' },
                    { id: 'structured_courses', label: 'Structured Courses', icon: '📚' },
                    { id: 'reading_theory', label: 'Articles & Theory', icon: '📄' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setLearningPreference(fmt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        learningPreference === fmt.id
                          ? 'bg-indigo-600 text-white border-indigo-500 font-medium shadow-sm'
                          : 'bg-slate-950 border-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-base mb-1">{fmt.icon}</div>
                      <div className="text-xs font-semibold">{fmt.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep(2)}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={submitting}
                onClick={handleCompleteOnboarding}
                icon={<Sparkles className="w-4 h-4 ml-1" />}
              >
                Launch Diagnostic Assessment
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <p>PathPilot AI • Automated Prerequisite Graph & Adaptation Calibration</p>
      </footer>
    </div>
  );
}
