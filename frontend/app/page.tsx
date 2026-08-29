import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Milestone,
  Sparkles,
  GitBranch,
  Target,
  BrainCircuit,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const lifecycleSteps = [
    { name: 'Discover', desc: 'Identify verified target engineering roles with industry benchmarks.' },
    { name: 'Diagnose', desc: 'Map your baseline competencies through calibrated diagnostic assessments.' },
    { name: 'Understand', desc: 'Visualize exact prerequisite gaps across the skill dependency graph.' },
    { name: 'Learn', desc: 'Engage with prioritized, explainable project-based learning actions.' },
    { name: 'Adapt', desc: 'Every quiz, project, and study hour recalculates your readiness state.' },
    { name: 'Progress', desc: 'Achieve verified milestone mastery with career-ready competency.' },
  ];

  return (
    <div className="min-h-screen surface-base text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-500 transition-colors">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-sm tracking-tight text-white">PathPilot</span>
              <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest hidden sm:inline">AI Compass</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/careers"
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Career Tracks
            </Link>
            <Link
              href="/auth"
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 sm:py-28 flex-1 flex flex-col items-center justify-center text-center space-y-20">
        {/* Headline & CTAs */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-white/[0.08] text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Continuous Adaptive Learning Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            The Intelligent Career Compass for Engineers.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            PathPilot maps where you are, where you want to go, what is stopping you, and exactly what to learn next.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-medium rounded-xl border border-white/[0.08] transition-all flex items-center justify-center gap-2"
            >
              <span>See How It Works</span>
            </Link>
          </div>
        </div>

        {/* 6-Stage Core Lifecycle Progression */}
        <div className="w-full space-y-8">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest">
              Intelligent Adaptation Loop
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              How PathPilot Drives Your Mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {lifecycleSteps.map((step, idx) => (
              <div
                key={step.name}
                className="surface-card rounded-xl p-5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-indigo-400">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    Stage {idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">{step.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Core Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left pt-4">
          <div className="surface-card rounded-xl p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Prerequisite DAG Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforces strict pedagogical dependency resolution. Milestones unlock only when prerequisite competencies are verified.
            </p>
          </div>

          <div className="surface-card rounded-xl p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Multi-Factor Readiness</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Combines diagnostic accuracy, completion rate, and study velocity to compute mathematically grounded career readiness.
            </p>
          </div>

          <div className="surface-card rounded-xl p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Explainable Next Action</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every recommendation transparently details why it is chosen, its career impact score, and estimated completion time.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-medium text-slate-400">PathPilot AI • Intelligent Career & Learning Compass</span>
          <span>FastAPI • Next.js • PostgreSQL 16 • Vector Embeddings</span>
        </div>
      </footer>
    </div>
  );
}
