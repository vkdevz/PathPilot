import Link from 'next/link';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Trophy,
  Layers,
  Milestone,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Activity
} from 'lucide-react';

export default function LandingPage() {
  const learnerJourneySteps = [
    { num: '01', question: 'Where am I going?', desc: 'Select high-demand career tracks (Data Scientist, AI Engineer, Fullstack, Cloud, Security) with market salary benchmarks.' },
    { num: '02', question: 'Where am I now?', desc: 'Take domain-specific diagnostic assessments to map baseline competencies.' },
    { num: '03', question: 'What am I missing?', desc: 'Discover exact topic gaps across the prerequisite DAG dependency graph.' },
    { num: '04', question: 'What should I do next?', desc: 'Follow a phased staircase roadmap tailored to your experience and weekly hours.' },
    { num: '05', question: 'Why should I do it?', desc: 'Get explainable rationale on why every project, course, and practice is recommended.' },
    { num: '06', question: 'How am I progressing?', desc: 'Track study heatmaps, milestone completions, skill score gains, and guild XP.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-glow-indigo group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white">
                PathPilot 2.0
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                Personal Learning Navigator
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/careers"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              Careers
            </Link>
            <Link
              href="/auth"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 sm:py-24 flex-1 flex flex-col items-center justify-center text-center space-y-16">
        <div className="space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-semibold uppercase tracking-wider shadow-inner-glow">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Career Navigation • Powered by FastAPI & PostgreSQL 16</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Stop Guessing Your Next Move.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
              Navigate With AI Precision.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            PathPilot is your intelligent personal learning navigator. Identify exact skill deficiencies, follow an adaptive staircase roadmap, and master verified engineering competencies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-brand-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-glow-indigo transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Start Free Personalized Journey</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Explore Demo Dashboard</span>
            </Link>
          </div>
        </div>

        {/* 6 Core Questions Grid */}
        <div className="w-full space-y-6 text-left">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              The PathPilot Paradigm
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              6 Questions Driving Your Personal Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {learnerJourneySteps.map((step) => (
              <div
                key={step.num}
                className="glass-panel-interactive rounded-3xl p-6 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                      Step {step.num}
                    </span>
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">{step.question}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture & Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-panel rounded-3xl p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Prerequisite DAG Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No skipped dependencies. Sequential staircase milestones unlock only when prerequisites are satisfied.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Authoritative Backend Validation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All quiz scores, roadmap states, and XP are verified on PostgreSQL with zero client-side manipulation trust.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Explainable Recommendations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent rationale explaining how each recommended course, project, or article bridges your specific gaps.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">PathPilot 2.0 — Enterprise Career & Learning Navigator</p>
        <p>© 2026 PathPilot AI Inc. Locked Stack: Next.js + FastAPI + PostgreSQL 16 + Supabase Auth.</p>
      </footer>
    </div>
  );
}
