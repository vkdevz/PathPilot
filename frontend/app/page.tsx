import Link from 'next/link';
import { Compass, Sparkles, ArrowRight, ShieldCheck, Zap, BookOpen, Trophy } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                PathPilot AI
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">
                Enterprise v2.0
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/careers"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
            >
              Career Tracks
            </Link>
            <Link
              href="/auth"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>PostgreSQL 16 + pgvector + Supabase Auth Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-white mb-6">
          Navigate your high-growth tech career with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
            AI Precision
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
          Pinpoint exact skill deficiencies through diagnostic assessments, generate dynamic step-by-step roadmaps, and master real-world engineering concepts.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/careers"
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 text-amber-300" />
            <span>Select Career Track</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Go to Learner Dashboard</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Diagnostic Skill Assessment</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Domain-calibrated diagnostic quizzes evaluate real competencies and automatically detect prerequisite gaps.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Personalized Progression</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Step-by-step milestone unlocks tailored to your pacing, weekly goals, and preferred learning formats.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Supabase Enterprise Auth</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              End-to-end user isolation, verified JWT tokens, and normalized PostgreSQL relational data protection.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/30 py-6 text-center text-xs text-slate-500">
        <p>© 2026 PathPilot AI Inc. Locked Stack: Next.js + FastAPI + PostgreSQL 16 + Supabase Auth.</p>
      </footer>
    </div>
  );
}
