'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  BarChart,
  RotateCcw
} from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import type { AssessmentDetail, AssessmentResult, Question } from '../../../types';

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
  const answeredCount = Object.keys(selectedAnswers).length;
  const isComplete = answeredCount >= totalQ;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">PathPilot AI</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span>Diagnostic Quest</span>
            <span>•</span>
            <span className="text-indigo-400 uppercase tracking-wider">{assessment?.career_name || careerSlug}</span>
          </div>
        </div>
      </header>

      {/* Main Assessment Container */}
      <main className="max-w-4xl mx-auto px-6 py-10 flex-1 w-full flex flex-col justify-center">
        {result ? (
          /* Results Card */
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-950/40 text-center space-y-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Diagnostic Calibrated</span>
              <h1 className="text-3xl font-extrabold text-white mt-1">Assessment Evaluation Complete</h1>
              <p className="text-sm text-slate-400 mt-2">
                Your personalized staircase roadmap has been generated and saved to PostgreSQL.
              </p>
            </div>

            {/* Score Ring */}
            <div className="inline-block p-6 rounded-3xl bg-slate-950/60 border border-slate-800">
              <span className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                {result.overall_score}%
              </span>
              <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mt-1">
                Overall Competency Score
              </span>
            </div>

            {/* Topic Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400 uppercase block mb-1">
                  Strong Topics ({result.strong_topics.length})
                </span>
                <p className="text-xs text-slate-300">
                  {result.strong_topics.map((t) => t.name).join(', ') || 'None (ready to learn)'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-400 uppercase block mb-1">
                  Moderate Topics ({result.moderate_topics.length})
                </span>
                <p className="text-xs text-slate-300">
                  {result.moderate_topics.map((t) => t.name).join(', ') || 'None identified'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-xs font-bold text-rose-400 uppercase block mb-1">
                  Priority Skill Gaps ({result.weak_topics.length})
                </span>
                <p className="text-xs text-slate-300">
                  {result.weak_topics.map((t) => t.name).join(', ') || 'None detected'}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setResult(null);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                }}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <span>Launch Personalized Staircase Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : currentQ ? (
          /* Question Card */
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-indigo-950/40 space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Question {currentIndex + 1} of {totalQ}</span>
                <span>{Math.round(((currentIndex + 1) / totalQ) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                {currentQ.difficulty} • {currentQ.skill_name || 'Core Skill'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
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
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-700 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-sm font-medium leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav Controls */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 disabled:opacity-30 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentIndex < totalQ - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Calibrating...' : 'Submit & Generate Roadmap'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-spin-slow" />
            <p className="text-sm text-slate-400">Loading diagnostic question bank...</p>
          </div>
        )}
      </main>
    </div>
  );
}
