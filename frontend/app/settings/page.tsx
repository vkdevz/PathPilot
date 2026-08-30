'use client';

import React, { useEffect, useState } from 'react';
import { User, Clock, Save, CheckCircle2, Sun, Moon, Laptop, Palette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../lib/api-client';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
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
      pageSubtitle="Manage your learner profile, baseline experience level, visual theme, and study schedule."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Visual Appearance & Theme Selection */}
          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <Palette className="w-4 h-4 text-[#007AFF]" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">Appearance & Theme</h3>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Color Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#EAF3FF] border-[#007AFF] text-[#007AFF] font-semibold shadow-sm'
                      : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                  }`}
                >
                  <Sun className="w-5 h-5 text-[#FF9F0A]" />
                  <span className="text-xs">Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/20 border-[#007AFF] text-[#007AFF] font-semibold shadow-sm'
                      : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                  }`}
                >
                  <Moon className="w-5 h-5 text-[#0A84FF]" />
                  <span className="text-xs">Dark Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/20 border-[#007AFF] text-[#007AFF] font-semibold shadow-sm'
                      : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                  }`}
                >
                  <Laptop className="w-5 h-5 text-[#86868B]" />
                  <span className="text-xs">System Match</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <User className="w-4 h-4 text-[#007AFF]" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">Account Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'learner@pathpilot.ai'}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#86868B] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Experience & Pacing */}
          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <Clock className="w-4 h-4 text-[#007AFF]" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">Study Schedule</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
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

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6E6E73] dark:text-[#AEAEB2] font-medium">Target Weekly Hours:</span>
                <span className="text-[#007AFF] font-bold font-mono">{weeklyHours} Hours / Week</span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                step={2}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                className="w-full accent-[#007AFF] cursor-pointer"
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
              <span className="text-xs font-medium text-[#34C759] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Preferences updated successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
