'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Clock, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.profile?.experience_level || 'Beginner');
  const [weeklyHours, setWeeklyHours] = useState(user?.profile?.weekly_hours_goal || 10);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.display_name) setDisplayName(user.display_name);
    if (user?.profile?.experience_level) setExperienceLevel(user.profile.experience_level);
    if (user?.profile?.weekly_hours_goal) setWeeklyHours(user.profile.weekly_hours_goal);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (displayName !== user?.display_name) {
        await apiClient.syncUser({ display_name: displayName });
      }

      await apiClient.updateProfile({
        experience_level: experienceLevel,
        weekly_hours_goal: weeklyHours,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      pageTitle="Settings & Preferences"
      pageSubtitle="Manage your learner profile, baseline experience level, and study schedule."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Account Details */}
          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <User className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">Account Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950/80 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'learner@pathpilot.ai'}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950/40 border border-white/[0.04] text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Experience & Pacing */}
          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">Study Schedule</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
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

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Target Weekly Hours:</span>
                <span className="text-indigo-400 font-bold font-mono">{weeklyHours} Hours / Week</span>
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
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={saving}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Preferences
            </Button>

            {saved && (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Preferences updated successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
