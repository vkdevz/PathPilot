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
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#E5E5EA] dark:border-[#2C2C2E] bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#007AFF] flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">PathPilot</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-[#6E6E73] dark:text-[#AEAEB2] font-medium">
            <span>Step {step} of 3</span>
            <div className="w-20 h-1.5 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] overflow-hidden">
              <div
                className="h-full bg-[#007AFF] transition-all duration-300"
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF]">
                Question 1 • Target Direction
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Select Your Target Role
              </h1>
              <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] max-w-md mx-auto">
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
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-left shadow-sm ${
                      isSelected
                        ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border-[#007AFF] ring-1 ring-[#007AFF]/30'
                        : 'surface-card hover:border-[#007AFF]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{career.icon || '🎯'}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#007AFF]" />
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{career.name}</h3>
                    <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-1 line-clamp-2">{career.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-[#6E6E73] dark:text-[#AEAEB2] pt-2 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
                      <span>{career.salary_range}</span>
                      <span className="text-[#34C759]">{career.market_demand_score}% Demand</span>
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF]">
                Question 2 • Current Baseline
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Your Background & Experience
              </h1>
              <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] max-w-md mx-auto">
                Helps determine the starting depth of your diagnostic evaluation.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Current Engineering Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        experienceLevel === lvl
                          ? 'bg-[#007AFF] text-white border-[#007AFF] font-semibold shadow-sm'
                          : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Brief Background or Goal (Optional)
                </label>
                <textarea
                  rows={3}
                  value={naturalLanguageBio}
                  onChange={(e) => setNaturalLanguageBio(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF]"
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF]">
                Question 3 • Calibration
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Study Pacing & Modality
              </h1>
              <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] max-w-md mx-auto">
                We pace your milestones to fit your weekly schedule and format preferences.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Target Weekly Study Commitment</span>
                  <span className="font-bold text-[#007AFF] font-mono">{weeklyHours} Hours / Week</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={5}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-[#007AFF]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
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
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        learningPreference === fmt.id
                          ? 'bg-[#007AFF] text-white border-[#007AFF] font-medium shadow-sm'
                          : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
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
      <footer className="border-t border-[#E5E5EA] dark:border-[#2C2C2E] bg-white/60 dark:bg-[#1C1C1E]/60 py-4 text-center text-xs text-[#86868B]">
        <p>PathPilot AI • Automated Prerequisite Graph & Adaptation Calibration</p>
      </footer>
    </div>
  );
}
