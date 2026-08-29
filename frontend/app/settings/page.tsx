'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Settings as SettingsIcon, Save, CheckCircle2, Shield, Target, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import type { Career } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.profile?.experience_level || 'Beginner');
  const [weeklyHours, setWeeklyHours] = useState(user?.profile?.weekly_hours_goal || 10);
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>('data-scientist');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.display_name) setDisplayName(user.display_name);
    if (user?.profile?.experience_level) setExperienceLevel(user.profile.experience_level);
    if (user?.profile?.weekly_hours_goal) setWeeklyHours(user.profile.weekly_hours_goal);
    apiClient.getCareers().then(setCareers).catch(console.error);
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
      pageTitle="Learner Profile & Settings"
      pageSubtitle="Manage your account details, target career specialization, and weekly study commitments."
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Account Details */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <User className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'learner@pathpilot.ai'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Experience & Pacing */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Study Preferences</h3>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Technical Experience Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      experienceLevel === lvl
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Weekly Hours Target:</span>
                <span className="text-indigo-400">{weeklyHours} Hours / Week</span>
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
          <div className="flex items-center gap-4">
            <Button
              variant="glow"
              size="md"
              type="submit"
              loading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Settings
            </Button>

            {saved && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Preferences updated successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
