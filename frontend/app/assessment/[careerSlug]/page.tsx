'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  BookOpen,
  Milestone,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import type { AssessmentDetail, AssessmentResult, Question } from '../../../types';
import { AppShell } from '../../../components/layout/AppShell';
import { AssessmentProgress } from '../../../components/assessment/AssessmentProgress';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { SkeletonCard } from '../../../components/ui/Skeleton';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const careerSlug = (params?.careerSlug as string) || 'data-scientist';

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getAssessment(careerSlug)
      .then((data) => setAssessment(data))
      .catch((err) => console.error('Failed to load assessment:', err))
      .finally(() => setLoading(false));
  }, [careerSlug]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (assessment && currentIndex < assessment.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setSubmitting(true);

    const answersPayload = assessment.questions.map((q) => ({
      question_id: q.id,
      selected_option: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : 0,
    }));

    try {
      const res = await apiClient.submitAssessment(careerSlug, answersPayload);
      setResult(res);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ: Question | undefined = assessment?.questions[currentIndex];
  const totalQ = assessment?.questions.length || 1;

  return (
    <AppShell
      pageTitle={result ? 'Diagnostic Position Report' : `Diagnostic Assessment: ${assessment?.career_name || careerSlug}`}
      pageSubtitle={
        result
          ? 'Calibrated competency baseline stored in database. Learning roadmap generated.'
          : 'Answer domain questions to detect skill gaps and calibrate your learning milestones.'
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {loading ? (
          <SkeletonCard />
        ) : result ? (
          /* Structured Assessment Results */
          <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2 pb-4 border-b border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Diagnostic Complete
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Your Current Position
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Verified skill scores have been recorded to your learner profile.
              </p>

              <div className="pt-3">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {result.overall_score}%
                </span>
                <span className="block text-[10px] uppercase font-semibold text-slate-500 mt-0.5">
                  Overall Assessed Proficiency
                </span>
              </div>
            </div>

            {/* 3-Part Position Breakdown: Strongest / Biggest Gaps / Critical Bottlenecks */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Strongest Areas</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(result.strong_topics || []).map((t) => t.name).join(', ') || 'Ready to build foundation!'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Target className="w-3.5 h-3.5" />
                  <span>Developing Competencies</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(result.moderate_topics || []).map((t) => t.name).join(', ') || 'None identified'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Highest-Priority Skill Gaps</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(result.weak_topics || []).map((t) => t.name).join(', ') || 'No critical gaps detected'}
                </p>
              </div>
            </div>

            {/* Next Recommended Action CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setResult(null);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                }}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Retake Diagnostic
              </Button>
              <Link href="/roadmap">
                <Button variant="primary" size="md" icon={<Milestone className="w-4 h-4 text-white" />}>
                  Explore Personalized Roadmap
                </Button>
              </Link>
            </div>
          </div>
        ) : currentQ ? (
          /* Focused Question View */
          <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
            <AssessmentProgress
              currentQuestion={currentIndex + 1}
              totalQuestions={totalQ}
            />

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="indigo" size="sm">{currentQ.difficulty}</Badge>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  {currentQ.skill_name || 'Competency'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white leading-snug">
                {currentQ.question_text}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 pt-1">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white font-medium'
                        : 'bg-slate-950/60 border-white/[0.06] text-slate-300 hover:bg-slate-900 hover:border-white/[0.12]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 text-xs font-semibold ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-white/[0.08] bg-slate-900 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div className="pt-4 flex items-center justify-between border-t border-white/[0.06]">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>

              {currentIndex < totalQ - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  loading={submitting}
                  onClick={handleSubmit}
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="surface-card rounded-2xl p-10 text-center text-xs text-slate-400 space-y-3">
            <p>No questions found for this track. Please select another career.</p>
            <Link href="/careers" className="inline-block">
              <Button variant="primary" size="sm">
                Browse Careers
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
