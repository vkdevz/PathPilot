'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareHeart,
  Zap,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<string>('useful');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paceChange, setPaceChange] = useState<string>('balanced');
  const [paceSubmitting, setPaceSubmitting] = useState(false);
  const [paceSaved, setPaceSaved] = useState(false);

  // Adaptive Demonstration State
  const [simulating, setSimulating] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<any>(null);

  const feedbackOptions = [
    { id: 'too_easy', label: 'Too Easy', desc: 'Accelerate pacing and unlock subsequent milestones.' },
    { id: 'too_hard', label: 'Too Hard', desc: 'Insert supplementary preparatory practice.' },
    { id: 'useful', label: 'Well Calibrated', desc: 'Accurately matched to current skill level.' },
    { id: 'not_useful', label: 'Needs Improvement', desc: 'Resource content or structure needs refinement.' },
  ];

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.submitFeedback({
        feedback_type: feedbackType,
        notes,
      });
      setSubmitted(true);
      setNotes('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaceUpdate = async () => {
    setPaceSubmitting(true);
    try {
      const hoursMap: Record<string, number> = {
        casual: 5,
        balanced: 10,
        accelerated: 20,
      };
      await apiClient.updateProfile({
        learning_pace: paceChange,
        weekly_hours_goal: hoursMap[paceChange] || 10,
      });
      setPaceSaved(true);
      setTimeout(() => setPaceSaved(false), 3000);
    } catch (err) {
      console.error('Error updating pace:', err);
    } finally {
      setPaceSubmitting(false);
    }
  };

  const handleSimulateEvidence = async () => {
    setSimulating(true);
    try {
      // Ingest real evaluation evidence event
      const res = await apiClient.submitEvidence({
        skill_id: 'stats-ds',
        evidence_type: 'assessment',
        score: 0.85,
        raw_score: 85,
        metadata: { assessment_id: 'diag-stats-01', speed_seconds: 120 },
      });
      setSimulatedResult(res);
    } catch (err) {
      console.error('Simulation note:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <AppShell
      pageTitle="Adaptive Learning & Feedback Hub"
      pageSubtitle="Understand how PathPilot recalculates your readiness, pacing, and curriculum sequencing."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Signature Feature: The Adaptive Moment Visualizer */}
        <div className="surface-card rounded-2xl p-6 space-y-5 border-l-4 border-l-[#007AFF] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
            <div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Continuous Adaptation Lifecycle
                </h3>
              </div>
              <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-0.5">
                How live evidence mutates proficiency, unlocks prerequisites, and shifts recommendations
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              loading={simulating}
              onClick={handleSimulateEvidence}
              icon={<Zap className="w-3.5 h-3.5" />}
            >
              Trigger Live Evidence Event
            </Button>
          </div>

          {/* 6-Stage Visual Chain */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-1">
              <span className="text-[10px] font-semibold text-[#86868B] uppercase">1. Before</span>
              <p className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">Estimated State (45%)</p>
            </div>
            <div className="p-3 rounded-xl bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border border-[#007AFF]/30 space-y-1">
              <span className="text-[10px] font-semibold text-[#007AFF] uppercase">2. Evidence</span>
              <p className="text-[#007AFF] font-semibold">85% Quiz Score</p>
            </div>
            <div className="p-3 rounded-xl bg-[#EAF8EE] dark:bg-[#30D158]/15 border border-[#34C759]/30 space-y-1">
              <span className="text-[10px] font-semibold text-[#34C759] uppercase">3. Skill State</span>
              <p className="text-[#34C759] font-semibold">45% → 78%</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-1">
              <span className="text-[10px] font-semibold text-[#86868B] uppercase">4. Gap Closed</span>
              <p className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">Prereq Unlocked</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-1">
              <span className="text-[10px] font-semibold text-[#86868B] uppercase">5. Recs Shift</span>
              <p className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">New Next Best</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-1">
              <span className="text-[10px] font-semibold text-[#86868B] uppercase">6. Roadmap</span>
              <p className="text-[#007AFF] font-semibold">Snapshot v2</p>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simulatedResult && (
            <div className="p-4 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#007AFF]/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#34C759]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live State Mutation Executed on PostgreSQL</span>
              </div>
              <p className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                {simulatedResult.reasoning ||
                  'Statistics proficiency adjusted from 45% to 78%. Prerequisite downstream dependencies unlocked.'}
              </p>
              <div className="pt-1">
                <Link href="/dashboard" className="text-xs text-[#007AFF] hover:text-[#006EDB] font-medium flex items-center gap-1">
                  <span>View updated dashboard readiness</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Pacing Calibration Card */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
            <div>
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Study Pace & Weekly Target
              </h3>
              <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2]">Adjust your learning intensity</p>
            </div>
            {paceSaved && (
              <span className="text-xs font-semibold text-[#34C759] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pacing Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'casual', label: 'Casual (5h/week)', desc: 'Light pace for busy schedules' },
              { id: 'balanced', label: 'Balanced (10h/week)', desc: 'Standard steady milestone progression' },
              { id: 'accelerated', label: 'Accelerated (20h/week)', desc: 'Fast-track transition into industry' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaceChange(p.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paceChange === p.id
                    ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border-[#007AFF] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium shadow-sm'
                    : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                }`}
              >
                <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{p.label}</div>
                <div className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] mt-1">{p.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              loading={paceSubmitting}
              onClick={handlePaceUpdate}
            >
              Update Pacing
            </Button>
          </div>
        </div>

        {/* Qualitative Feedback Form */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
            <MessageSquareHeart className="w-4 h-4 text-[#007AFF]" />
            <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Rate Content Calibration
            </h3>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {feedbackOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFeedbackType(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    feedbackType === opt.id
                      ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 border-[#007AFF] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium shadow-sm'
                      : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                  }`}
                >
                  <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{opt.label}</div>
                  <div className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                Additional Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share any details on course pacing or clarity..."
                className="w-full p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button variant="primary" size="sm" loading={submitting}>
                Submit Feedback
              </Button>
              {submitted && (
                <span className="text-xs font-medium text-[#34C759] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Feedback recorded!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
