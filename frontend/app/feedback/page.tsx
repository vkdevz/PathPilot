'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareHeart,
  Sparkles,
  Zap,
  Gauge,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock
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

  const feedbackOptions = [
    { id: 'too_easy', label: '⚡ Too Easy', desc: 'Material is basic; fast-track to next milestones.' },
    { id: 'too_hard', label: '📚 Too Hard', desc: 'Concepts are challenging; suggest preparatory practice.' },
    { id: 'useful', label: '⭐ Highly Useful', desc: 'Well aligned with industry expectations and goals.' },
    { id: 'not_useful', label: '⚠️ Needs Improvement', desc: 'Content outdated or difficult to follow.' },
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

  return (
    <AppShell
      pageTitle="Feedback & Adaptive Calibration Hub"
      pageSubtitle="Help calibrate your learning progression, pacing, and difficulty preferences."
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Milestone Difficulty Feedback Form */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <MessageSquareHeart className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Rate Learning Progression & Material
            </h3>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-3">
                Select Feedback Signal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feedbackOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFeedbackType(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      feedbackType === opt.id
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-glow-indigo'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold text-white block">{opt.label}</span>
                    <span className="text-xs text-slate-400 mt-1 block leading-relaxed">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Additional Notes / Feedback Details
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Would like more hands-on coding notebooks for PyTorch autograd..."
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <Button
              variant="glow"
              size="md"
              type="submit"
              loading={submitting}
              icon={<Send className="w-4 h-4" />}
            >
              Submit Calibration Feedback
            </Button>

            {submitted && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! Your feedback has been recorded in the adaptive calibration ledger.</span>
              </div>
            )}
          </form>
        </div>

        {/* Pacing Calibration Selector */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Calibrate Weekly Roadmap Pacing
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'casual', label: '🌱 Casual', hours: '~5h / week', desc: '1 milestone every 2 weeks' },
              { id: 'balanced', label: '⚖️ Balanced', hours: '~10h / week', desc: '1-2 milestones weekly' },
              { id: 'accelerated', label: '🚀 Accelerated', hours: '~20h / week', desc: '3+ milestones weekly' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaceChange(p.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paceChange === p.id
                    ? 'bg-indigo-600/25 border-indigo-500 shadow-glow-indigo'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{p.label}</span>
                  <span className="text-xs font-semibold text-indigo-400">{p.hours}</span>
                </div>
                <span className="text-xs text-slate-400 block">{p.desc}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="md"
              loading={paceSubmitting}
              onClick={handlePaceUpdate}
            >
              Update Pacing Preference
            </Button>
            {paceSaved && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Pacing saved!
              </span>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
