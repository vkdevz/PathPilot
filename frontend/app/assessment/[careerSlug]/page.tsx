'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Milestone,
  Target,
  ShieldAlert,
  Trophy,
  Sparkles,
  BookOpen,
  ChevronRight,
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

    // Accurately map selected answers (use -1 for unselected questions)
    const answersPayload = assessment.questions.map((q) => ({
      question_id: q.id,
      selected_option: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
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
          ? `Calibrated competency baseline for ${result.career_name || assessment?.career_name || 'your career goal'}. Verified in PostgreSQL.`
          : 'Answer domain questions to detect skill gaps and calibrate your learning milestones.'
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {loading ? (
          <SkeletonCard />
        ) : result ? (
          /* Structured Diagnostic Position Report */
          <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="text-center space-y-2 pb-5 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8EE] dark:bg-[#30D158]/15 border border-[#34C759]/30 text-[#34C759] text-[11px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Diagnostic Verified</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                YOUR CURRENT POSITION
              </h2>
              <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] max-w-sm mx-auto">
                Track: <span className="font-semibold text-[#007AFF]">{result.career_name || assessment?.career_name || 'Selected Track'}</span>
              </p>

              <div className="pt-3">
                <span className="text-5xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  {result.overall_score}%
                </span>
                <span className="block text-xs font-bold text-[#007AFF] uppercase mt-1">
                  {result.position_rank || (result.overall_score >= 80 ? 'Top 15% — Target Ready' : 'Top 35% — Developing Contender')}
                </span>
              </div>
            </div>

            {/* 3-Part Position Breakdown: Strongest / Developing / Gaps */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#EAF8EE] dark:bg-[#30D158]/10 border border-[#34C759]/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#34C759]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Strongest Areas (Mastered)</span>
                </div>
                <p className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                  {(result.strong_topics || []).map((t) => t.name).join(', ') || 'Ready to establish foundational mastery!'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFF4E0] dark:bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF9F0A]">
                  <Target className="w-4 h-4" />
                  <span>Developing Competencies (Intermediate)</span>
                </div>
                <p className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                  {(result.moderate_topics || []).map((t) => t.name).join(', ') || 'None in intermediate range'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFF0EF] dark:bg-[#FF453A]/10 border border-[#FF3B30]/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF3B30]">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Highest-Priority Skill Gaps</span>
                </div>
                <p className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                  {(result.weak_topics || []).map((t) => t.name).join(', ') || 'No critical prerequisite bottlenecks detected'}
                </p>
              </div>
            </div>

            {/* Next Recommended Learning Steps */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
                  Immediate Recommended Actions
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-[#007AFF] shrink-0" />
                        <div>
                          <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block">
                            {rec.resource_title}
                          </span>
                          <span className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
                            Skill: {rec.skill_name} • {rec.estimated_minutes} min estimated
                          </span>
                        </div>
                      </div>
                      <Badge variant="primary" size="sm">{rec.priority} Priority</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
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
                  Explore Calibrated Roadmap
                </Button>
              </Link>
            </div>
          </div>
        ) : currentQ ? (
          /* Focused Question View */
          <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <AssessmentProgress
              currentQuestion={currentIndex + 1}
              totalQuestions={totalQ}
            />

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">{currentQ.difficulty}</Badge>
                <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wide">
                  {currentQ.skill_name || 'Competency'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
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
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border-[#007AFF] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold'
                        : 'bg-white dark:bg-[#1C1C1E] border-[#E5E5EA] dark:border-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 text-xs font-semibold ${
                        isSelected
                          ? 'bg-[#007AFF] border-[#007AFF] text-white'
                          : 'border-[#D2D2D7] dark:border-[#38383A] bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#AEAEB2]'
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
            <div className="pt-4 flex items-center justify-between border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
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
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="surface-card rounded-2xl p-10 text-center text-xs text-[#6E6E73] dark:text-[#AEAEB2] space-y-3">
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
