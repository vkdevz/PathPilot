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
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen surface-base text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Compass className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
          <span className="text-xs font-medium text-slate-400">Loading PathPilot...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-base text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-500 transition-colors">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-sm tracking-tight text-white">PathPilot</span>
                <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest hidden sm:inline">AI Compass</span>
              </div>
            </Link>
          </div>

          {/* Quick Metrics & User Session */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                title="Earned XP"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-white/[0.06] text-amber-300 text-xs font-medium"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{user?.profile?.xp || 0} XP</span>
              </div>

              <div
                title="Active Study Streak"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-white/[0.06] text-rose-300 text-xs font-medium"
              >
                <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span>{user?.profile?.streak_days || 1}d Streak</span>
              </div>
            </div>

            {/* Profile Avatar / Logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/[0.06]">
              <Link
                href="/settings"
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md hover:bg-slate-900 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px] border border-indigo-500/20">
                  {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'L'}
                </div>
                <span className="max-w-[110px] truncate font-medium">{user?.display_name || 'Learner'}</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
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
            className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.06] hover:border-indigo-500/30 transition-all group"
          >
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-0.5">Target Track</div>
            <div className="text-xs font-semibold text-white group-hover:text-indigo-300 flex items-center justify-between transition-colors">
              <span className="truncate">{user?.profile?.target_career_id ? user.profile.target_career_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Data Scientist'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
          </Link>

          {/* Primary Navigation */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">Core Learning</div>
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="space-y-1 pt-4 border-t border-white/[0.06]">
            <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">System</div>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
            <div className="w-64 bg-slate-900 border-r border-white/[0.08] p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                      <Compass className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-sm text-white">PathPilot</span>
                  </div>
                  <button onClick={() => setMobileNavOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {[...primaryNav, ...secondaryNav].map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 pt-4 border-t border-white/[0.06]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
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
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {pageTitle}
                  </h1>
                )}
                {pageSubtitle && (
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
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
