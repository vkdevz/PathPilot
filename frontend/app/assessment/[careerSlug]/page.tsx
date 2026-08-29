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
  Milestone
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
      pageTitle={result ? 'Assessment Diagnostic Results' : `Diagnostic Assessment: ${assessment?.career_name || careerSlug}`}
      pageSubtitle={
        result
          ? 'Authoritative skill evaluations saved. Personalized staircase roadmap calibrated.'
          : 'Answer domain questions to detect skill gaps and calibrate your learning milestones.'
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <SkeletonCard />
        ) : result ? (
          /* Results Evaluation Report */
          <div className="glass-card-glow rounded-3xl p-8 sm:p-10 text-center space-y-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-brand-500 to-cyan-400 flex items-center justify-center mx-auto shadow-glow-indigo">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Diagnostic Benchmark Calibrated
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Evaluation Complete
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
                Your competency scores have been calculated by the backend and saved to your learner profile.
              </p>
            </div>

            {/* Score Pill */}
            <div className="inline-block p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
              <span className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
                {result.overall_score}%
              </span>
              <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mt-1">
                Overall Competency Score
              </span>
            </div>

            {/* Topic Breakdown Grid: Strong / Moderate / Weak */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Strong ({(result.strong_topics || []).length})</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(result.strong_topics || []).map((t) => t.name).join(', ') || 'Ready for mastery!'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Moderate ({(result.moderate_topics || []).length})</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(result.moderate_topics || []).map((t) => t.name).join(', ') || 'None identified'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-xs font-bold text-rose-400 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Needs Focus ({(result.weak_topics || []).length})</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(result.weak_topics || []).map((t) => t.name).join(', ') || 'No critical gaps detected'}
                </p>
              </div>
            </div>

            {/* Next Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setResult(null);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                }}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Retake Diagnostic
              </Button>
              <Link href="/roadmap">
                <Button variant="glow" size="lg" icon={<Milestone className="w-4 h-4 text-white" />}>
                  Explore Personalized Roadmap
                </Button>
              </Link>
            </div>
          </div>
        ) : currentQ ? (
          /* Question View */
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <AssessmentProgress
              currentQuestion={currentIndex + 1}
              totalQuestions={totalQ}
            />

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="indigo">{currentQ.difficulty}</Badge>
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  {currentQ.skill_name || 'Core Skill'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {currentQ.question_text}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-glow-indigo font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 text-xs font-bold ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'border-slate-700 bg-slate-900 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Nav Controls */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <Button
                variant="outline"
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
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="glow"
                  size="md"
                  loading={submitting}
                  onClick={handleSubmit}
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                >
                  Submit & Generate Roadmap
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center text-xs text-slate-400">
            <p>No questions found for this track. Please select another career.</p>
            <Link href="/careers" className="mt-4 inline-block">
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
