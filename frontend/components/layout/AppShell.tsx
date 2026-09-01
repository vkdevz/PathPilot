'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  Layers,
  Milestone,
  Sparkles,
  Bot,
  Briefcase,
  Activity,
  MessageSquareHeart,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Flame,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  actions?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  actions,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, supabaseUser, loading, signOut } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Authentication Route Guard
  React.useEffect(() => {
    if (!loading && !user && !supabaseUser) {
      router.replace('/auth');
    }
  }, [loading, user, supabaseUser, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const primaryNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/skills', label: 'Skills & Graph', icon: Layers },
    { href: '/roadmap', label: 'Roadmap', icon: Milestone },
    { href: '/recommendations', label: 'Recommendations', icon: Sparkles },
    { href: '/assistant', label: 'AI Navigator', icon: Bot },
  ];

  const secondaryNav = [
    { href: '/careers', label: 'Career Tracks', icon: Briefcase },
    { href: '/progress', label: 'Progress & Activity', icon: Activity },
    { href: '/feedback', label: 'Adaptation Hub', icon: MessageSquareHeart },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminNav = [
    { href: '/admin', label: 'Admin Dashboard', icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="min-h-screen surface-base flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] dark:bg-[#0A84FF]/20 border border-[#007AFF]/30 flex items-center justify-center animate-pulse">
            <Compass className="w-5 h-5 text-[#007AFF] animate-spin" />
          </div>
          <span className="text-xs font-medium text-[#6E6E73] dark:text-[#AEAEB2]">Loading PathPilot...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-base text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#007AFF] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#E5E5EA] dark:border-[#2C2C2E] bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#007AFF] flex items-center justify-center shadow-sm group-hover:bg-[#006EDB] transition-colors">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-sm tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">PathPilot</span>
                <span className="text-[10px] font-medium text-[#007AFF] uppercase tracking-widest hidden sm:inline">AI Navigation</span>
              </div>
            </Link>
          </div>

          {/* Quick Metrics & User Session */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div
                title="Verified Experience Points"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF4E0] dark:bg-[#FF9F0A]/15 border border-[#FF9F0A]/20 text-[#FF9F0A] text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5 fill-[#FF9F0A]" />
                <span>{user?.profile?.xp || 0} XP</span>
              </div>

              <div
                title="Active Study Streak"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF8EE] dark:bg-[#30D158]/15 border border-[#34C759]/20 text-[#34C759] text-xs font-semibold"
              >
                <Flame className="w-3.5 h-3.5 fill-[#34C759]" />
                <span>{user?.profile?.streak_days || 1}d Streak</span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Current theme: ${theme} (click to toggle)`}
              className="p-1.5 rounded-lg border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] hover:bg-[#F5F5F7] dark:hover:bg-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-all cursor-pointer"
              aria-label="Toggle Color Theme"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-[#FF9F0A]" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-[#0A84FF]" />
              ) : (
                <Laptop className="w-4 h-4 text-[#86868B]" />
              )}
            </button>

            {/* Profile Avatar / Logout */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E5E5EA] dark:border-[#2C2C2E]">
              <Link
                href="/settings"
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#EAF3FF] text-[#007AFF] flex items-center justify-center font-bold text-[10px] border border-[#007AFF]/20">
                  {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'L'}
                </div>
                <span className="max-w-[100px] truncate font-medium">{user?.display_name || 'Learner'}</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-md text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FFF0EF] dark:hover:bg-[#FF453A]/15 transition-colors cursor-pointer"
                title="Sign out of PathPilot"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 flex py-6 gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 space-y-6">
          {/* Target Track Chip */}
          <Link
            href="/careers"
            className="p-3.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] hover:border-[#007AFF]/40 transition-all group shadow-sm"
          >
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#86868B] mb-0.5">Target Track</div>
            <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#007AFF] flex items-center justify-between transition-colors">
              <span className="truncate">{user?.profile?.target_career_name || 'Select Career Track'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#007AFF] transition-colors" />
            </div>
          </Link>

          {/* Primary Navigation */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#86868B] mb-2">Core Learning</div>
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 text-[#007AFF] border border-[#007AFF]/20 font-semibold'
                      : 'text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-white dark:hover:bg-[#1C1C1E]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#007AFF]' : 'text-[#86868B]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="space-y-1 pt-4 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
            <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#86868B] mb-2">System</div>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 text-[#007AFF] border border-[#007AFF]/20 font-semibold'
                      : 'text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-white dark:hover:bg-[#1C1C1E]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#007AFF]' : 'text-[#86868B]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Admin Navigation (Admin Role Only) */}
          {isAdmin && (
            <div className="space-y-1 pt-4 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
              <div className="px-3 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#FF9F0A] mb-2">
                <span>Management</span>
                <span className="px-1.5 py-0.2 rounded bg-[#FFF4E0] dark:bg-[#FF9F0A]/20 text-[#FF9F0A] font-mono text-[9px] font-bold">Admin</span>
              </div>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#FFF4E0] dark:bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30 font-semibold'
                        : 'text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#FF9F0A] hover:bg-white dark:hover:bg-[#1C1C1E]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#FF9F0A]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex">
            <div className="w-64 bg-white dark:bg-[#1C1C1E] border-r border-[#E5E5EA] dark:border-[#2C2C2E] p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#007AFF] flex items-center justify-center">
                      <Compass className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">PathPilot</span>
                  </div>
                  <button onClick={() => setMobileNavOpen(false)} className="text-[#6E6E73] hover:text-[#1D1D1F]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {[...primaryNav, ...secondaryNav, ...(isAdmin ? adminNav : [])].map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                          isActive
                            ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 text-[#007AFF] font-semibold'
                            : 'text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-xs text-[#6E6E73] dark:text-[#AEAEB2]"
                >
                  {theme === 'light' ? <Sun className="w-4 h-4 text-[#FF9F0A]" /> : <Moon className="w-4 h-4 text-[#007AFF]" />}
                  <span className="capitalize">{theme} Mode</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-xs text-[#FF3B30] hover:text-[#E02E24]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 min-w-0 space-y-6">
          {(pageTitle || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
              <div>
                {pageTitle && (
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {pageTitle}
                  </h1>
                )}
                {pageSubtitle && (
                  <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-1 max-w-2xl leading-relaxed">
                    {pageSubtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};
