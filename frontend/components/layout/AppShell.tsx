'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  Briefcase,
  Layers,
  Milestone,
  Sparkles,
  Activity,
  BarChart3,
  Bot,
  MessageSquareHeart,
  Settings,
  LogOut,
  Zap,
  Flame,
  Menu,
  X,
  User as UserIcon,
  ChevronRight
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

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/careers', label: 'Career Tracks', icon: Briefcase },
    { href: '/skills', label: 'Skills & Map', icon: Layers },
    { href: '/roadmap', label: 'Roadmap Journey', icon: Milestone },
    { href: '/recommendations', label: 'Recommendations', icon: Sparkles },
    { href: '/progress', label: 'Progress & Heatmap', icon: Activity },
    { href: '/analytics', label: 'Analytics & Guild', icon: BarChart3 },
    { href: '/assistant', label: 'AI Navigator', icon: Bot },
    { href: '/feedback', label: 'Adaptation Hub', icon: MessageSquareHeart },
    { href: '/settings', label: 'Profile & Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-glow-indigo animate-pulse">
            <Compass className="w-6 h-6 text-white animate-spin" />
          </div>
          <span className="text-xs font-semibold text-slate-400">Authenticating PathPilot session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-glow-indigo group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white">PathPilot AI</span>
                <span className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase hidden sm:inline">Learning Navigator</span>
              </div>
            </Link>
          </div>

          {/* Quick Stats & User Profile Menu */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2">
              <div
                title="Earned Experience Points"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold shadow-inner-glow"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{user?.profile?.xp || 150} XP</span>
              </div>

              <div
                title="Active Study Streak"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold shadow-inner-glow"
              >
                <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span>{user?.profile?.streak_days || 3}d Streak</span>
              </div>
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <Link
                href="/settings"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                  {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[100px] truncate font-medium">{user?.display_name || 'Learner'}</span>
              </Link>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-750 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6 sticky top-24 self-start">
          <nav className="glass-panel rounded-3xl p-3 space-y-1" aria-label="Main Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>

          {/* Quick AI Help Banner */}
          <div className="glass-card-glow rounded-3xl p-4 text-center space-y-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center mx-auto shadow-glow-cyan">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-xs font-bold text-white">Need Learning Guidance?</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ask your AI Learning Navigator for explanations or study tips anytime.
            </p>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-semibold text-indigo-300 transition-colors w-full justify-center mt-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Launch AI Navigator</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative z-10 w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    <span className="font-bold text-white text-sm">PathPilot Menu</span>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content View */}
        <main className="flex-1 min-w-0 space-y-6">
          {(pageTitle || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                {pageTitle && (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {pageTitle}
                  </h1>
                )}
                {pageSubtitle && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
