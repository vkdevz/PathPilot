'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Flame,
  Trophy,
  Clock,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  BookOpen,
  Code2,
  Sparkles,
  FileText,
  ExternalLink,
  Award,
  Calendar,
  X,
  Plus,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { HeatmapDay, StudySession, StudyTimeSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function ProgressPage() {
  const { user, refreshUser } = useAuth();
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [studySummary, setStudySummary] = useState<StudyTimeSummary | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [completedList, setCompletedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Add Study Session
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('Python for Data Science');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [logging, setLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const [summaryRes, sessionsRes, completedRes, heatRes] = await Promise.allSettled([
        apiClient.getStudySummary(),
        apiClient.getStudySessions(50),
        apiClient.getCompletedProgress(50),
        apiClient.getHeatmap(28),
      ]);

      if (summaryRes.status === 'fulfilled') setStudySummary(summaryRes.value);
      if (sessionsRes.status === 'fulfilled') setStudySessions(sessionsRes.value);
      if (completedRes.status === 'fulfilled') setCompletedList(completedRes.value);
      if (heatRes.status === 'fulfilled') setHeatmap(heatRes.value);
    } catch (e) {
      console.error('Failed to load progress data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const handleAddStudySession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || durationMinutes <= 0) return;
    setLogging(true);
    try {
      const created = await apiClient.logStudySession({
        topic: topic.trim(),
        duration_minutes: durationMinutes,
        session_date: new Date(sessionDate).toISOString(),
        notes: notes.trim() || undefined,
      });

      setLogSuccess(`+${created.xp_earned} XP earned for logging ${created.duration_minutes} min study session!`);
      setTimeout(() => setLogSuccess(null), 4000);
      setIsModalOpen(false);
      setNotes('');

      // Refresh authoritative user profile state & progress data
      await refreshUser();
      await fetchProgressData();
    } catch (err) {
      console.error('Error logging study session:', err);
    } finally {
      setLogging(false);
    }
  };

  const getFormatIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'project':
        return <Code2 className="w-4 h-4 text-[#007AFF]" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-[#007AFF]" />;
      case 'practice':
      case 'lab':
        return <Sparkles className="w-4 h-4 text-[#FF9F0A]" />;
      default:
        return <FileText className="w-4 h-4 text-[#86868B]" />;
    }
  };

  const totalMinutes = studySummary?.total_minutes ?? studySessions.reduce((acc, curr) => acc + curr.duration_minutes, 0);
  const thisWeekMinutes = studySummary?.this_week_minutes ?? 0;
  const thisWeekSessions = studySummary?.this_week_sessions ?? 0;
  const todayMinutes = studySummary?.today_minutes ?? 0;
  const thisMonthMinutes = studySummary?.this_month_minutes ?? 0;

  const formatHoursMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <AppShell
      pageTitle="Learning Progress & Activity"
      pageSubtitle="Track continuous study sessions, 28-day activity heatmap, and verified completed learning history."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Study Session
          </Button>
          <button
            onClick={fetchProgressData}
            className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
            title="Refresh Progress"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {logSuccess && (
          <div className="p-3 rounded-xl bg-[#EAF8EE] dark:bg-[#30D158]/15 border border-[#34C759]/30 text-[#34C759] text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {logSuccess}
            </span>
            <button onClick={() => setLogSuccess(null)} className="text-[#34C759] hover:opacity-70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: STUDY TIME SUMMARY (REAL DATA)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
              Section 1: Study Time Analytics
            </h2>
            <span className="text-[10px] text-[#86868B]">Real PostgreSQL Persistence</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Primary Study Time Block */}
            <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-[#007AFF] mb-1">
                <span className="text-[10px] font-semibold uppercase text-[#86868B]">Study Time</span>
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {formatHoursMinutes(totalMinutes)}
              </h3>
              <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] font-medium">
                {thisWeekSessions} {thisWeekSessions === 1 ? 'session' : 'sessions'} • This week ({formatHoursMinutes(thisWeekMinutes)})
              </p>
            </div>

            {/* Today's Focus */}
            <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-[#34C759] mb-1">
                <span className="text-[10px] font-semibold uppercase text-[#86868B]">Today</span>
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {formatHoursMinutes(todayMinutes)}
              </h3>
              <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
                This Month: {formatHoursMinutes(thisMonthMinutes)}
              </p>
            </div>

            {/* Total XP */}
            <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-[#FF9F0A] mb-1">
                <span className="text-[10px] font-semibold uppercase text-[#86868B]">Total XP</span>
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {user?.profile?.xp || 0} XP
              </h3>
              <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
                Verified learner points
              </p>
            </div>

            {/* Streak */}
            <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-[#FF453A] mb-1">
                <span className="text-[10px] font-semibold uppercase text-[#86868B]">Consistency Streak</span>
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {user?.profile?.streak_days || 1} Days
              </h3>
              <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
                Continuous daily learning
              </p>
            </div>
          </div>

          {/* 28-Day Heatmap Card */}
          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">28-Day Study Heatmap</h3>
              </div>
              <span className="text-xs text-[#86868B]">
                {totalMinutes} minutes recorded across study sessions & completions
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2">
              {heatmap.map((d) => {
                const mins = d.minutes || 0;
                let bg = 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#86868B]';
                if (mins >= 60) bg = 'bg-[#007AFF] text-white border-[#007AFF] font-semibold';
                else if (mins >= 30) bg = 'bg-[#EAF3FF] dark:bg-[#0A84FF]/25 text-[#007AFF] border-[#007AFF]/30 font-medium';
                else if (mins > 0) bg = 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] border-[#E5E5EA]';

                return (
                  <div
                    key={d.date}
                    className={`p-2.5 rounded-xl border text-center transition-all ${bg}`}
                    title={`${d.date}: ${mins} minutes logged`}
                  >
                    <div className="text-[10px] uppercase font-mono text-[#86868B]">{d.date.slice(-2)}</div>
                    <div className="text-xs mt-1">{mins > 0 ? `${mins}m` : '—'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: STUDY SESSIONS (MANUAL LOGS)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E5EA] dark:border-[#2C2C2E] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#007AFF]" />
              <div>
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Section 2: Study Sessions</h3>
                <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
                  Manually logged focused learning time. Does not automatically mark courses as completed.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Add Study Session
            </Button>
          </div>

          {loading ? (
            <SkeletonCard />
          ) : studySessions.length > 0 ? (
            <div className="divide-y divide-[#E5E5EA] dark:divide-[#2C2C2E]">
              {studySessions.map((session) => (
                <div key={session.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {session.topic}
                      </h4>
                      <Badge variant="slate" size="sm">Study Session</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#86868B] mt-1">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {session.duration_minutes} min
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(session.session_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {session.xp_earned > 0 && (
                        <span className="text-[#34C759] font-medium">+{session.xp_earned} XP</span>
                      )}
                    </div>
                    {session.notes && (
                      <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] mt-1 italic">
                        &ldquo;{session.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#86868B] border border-[#E5E5EA] dark:border-[#38383A] self-start sm:self-center">
                    Logged Effort
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <Clock className="w-8 h-8 text-[#86868B] mx-auto opacity-50" />
              <p className="text-xs text-[#86868B]">No study sessions logged yet.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Log Your First Study Session
              </Button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: COMPLETED LEARNING (VERIFIED COMPLETIONS ONLY)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E5EA] dark:border-[#2C2C2E] pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#34C759]" />
              <div>
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Section 3: Completed Learning</h3>
                <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
                  Verified completed courses, projects, and modules. Never mixed with manual study sessions.
                </p>
              </div>
            </div>
            <span className="text-xs text-[#86868B]">
              {completedList.length} verified {completedList.length === 1 ? 'completion' : 'completions'}
            </span>
          </div>

          {loading ? (
            <SkeletonCard />
          ) : completedList.length > 0 ? (
            <div className="divide-y divide-[#E5E5EA] dark:divide-[#2C2C2E]">
              {completedList.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#EAF8EE] dark:bg-[#30D158]/15 border border-[#34C759]/30 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {item.resource_title}
                        </h4>
                        <Badge variant="primary" size="sm">{item.resource_type}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#86868B] mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.time_spent_minutes} min
                        </span>
                        <span className="text-[#34C759] font-medium">
                          +{item.xp_earned} XP
                        </span>
                        {item.completed_at && (
                          <span>
                            Completed {new Date(item.completed_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      {item.skills_taught && item.skills_taught.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.skills_taught.map((sk: string) => (
                            <span
                              key={sk}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#FBFBFD] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#AEAEB2] border border-[#E5E5EA] dark:border-[#38383A]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/resources/${item.resource_slug || item.resource_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:underline shrink-0 sm:self-center"
                  >
                    <span>Review Resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <BookOpen className="w-8 h-8 text-[#86868B] mx-auto opacity-50" />
              <p className="text-xs text-[#86868B]">No verified resource completions recorded yet.</p>
              <Link href="/recommendations" className="inline-block text-xs font-semibold text-[#007AFF] hover:underline">
                Explore recommended learning modules to complete →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ADD STUDY SESSION MODAL (EXPLICIT EFFORT LOGGING)
          ═══════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md surface-elevated rounded-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] dark:border-[#38383A]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Add Study Session
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudySession} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Resource / Topic
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Python for Data Science, SQL Analytics"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={720}
                    step={5}
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#007AFF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What key concept did you practice or build?"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] space-y-0.5">
                <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block">XP Reward:</span>
                <span>+{Math.min(50, Math.max(5, Math.floor(durationMinutes / 15) * 10))} XP will be authoritatively credited to your profile.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={logging}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Log Study Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
