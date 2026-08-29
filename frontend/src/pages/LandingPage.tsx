import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Target, 
  BrainCircuit, 
  Compass, 
  Flame, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Star,
  Search,
  Globe,
  Layers,
  Shield,
  Cpu
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, user } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    if (user) {
      setActiveView('career-selection');
    } else {
      setActiveView('auth');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 overflow-x-hidden relative font-sans">
      
      {/* Bright Anime Celestial Ambient Atmosphere Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Celestial Floating Orbs */}
        <div 
          className="absolute top-[-10%] left-[20%] w-[650px] h-[650px] bg-gradient-to-tr from-sky-200/50 via-brand-200/40 to-amber-100/50 rounded-full blur-[140px] transition-transform duration-1000 ease-out" 
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div 
          className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/40 via-purple-200/30 to-emerald-100/40 rounded-full blur-[160px] transition-transform duration-1000 ease-out" 
          style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
        />
        
        {/* Floating Magical Star Particles */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(16)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-amber-300 rounded-full animate-ping"
              style={{
                top: `${(i * 17) % 95}%`,
                left: `${(i * 23) % 95}%`,
                animationDuration: `${3 + (i % 4)}s`,
                animationDelay: `${i * 0.4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Story Container */}
      <div className="relative z-10">
        
        {/* ========================================================================= */}
        {/* SCENE 1 — OPENING & PATHPILOT INTRODUCTION */}
        {/* ========================================================================= */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center pt-20 pb-16">
          
          {/* Celestial Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 border border-brand-200/80 text-brand-700 text-xs sm:text-sm font-black mb-8 shadow-sm backdrop-blur-md animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
            <span>AI-POWERED ADAPTIVE CAREER JOURNEY</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl text-slate-900 leading-[1.08] mb-6">
            PATHPILOT
          </h1>

          {/* Subheading */}
          <h2 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent mb-6">
            Your skills. Your goal. Your path.
          </h2>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal mb-10">
            PathPilot understands your career goal, discovers your skill gaps, and creates a learning journey that adapts as you grow.
          </p>

          {/* Get Started CTAs */}
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={handleStart}
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-105 text-white font-black text-lg shadow-glow-celestial transition-all flex items-center space-x-3 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Free to access • No payment required</span>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="mt-20 flex flex-col items-center space-y-2 text-slate-400 text-xs font-bold animate-bounce">
            <span>SCROLL TO EXPLORE THE STORY</span>
            <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-brand-500 rounded-full animate-pulse" />
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* SCENE 2 — THE PROBLEM (THE WORLD OF TECH PATHS) */}
        {/* ========================================================================= */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center py-24">
          
          <span className="px-4 py-1.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-widest mb-6">
            CHAPTER 1 — THE QUEST
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-tight mb-8">
            The technology world has thousands of paths.
          </h2>

          {/* Floating Career Chips Grid */}
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-14">
            {[
              { icon: '🧙', title: 'Data Scientist' },
              { icon: '⚡', title: 'AI Engineer' },
              { icon: '☁️', title: 'Cloud Architect' },
              { icon: '🛡️', title: 'Cybersecurity' },
              { icon: '⚔️', title: 'Full Stack Dev' },
              { icon: '🧠', title: 'LLM Specialist' },
              { icon: '⚙️', title: 'Data Engineer' },
              { icon: '📱', title: 'Android Engineer' },
              { icon: '🎮', title: 'Game Developer' },
              { icon: '🔄', title: 'MLOps Engineer' },
              { icon: '⛓️', title: 'Blockchain Dev' },
              { icon: '📈', title: 'BI Analyst' },
            ].map((role, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl glass-panel border border-slate-200/80 shadow-sm flex flex-col items-center justify-center hover:scale-105 hover:border-brand-400 hover:shadow-md transition-all cursor-default"
              >
                <span className="text-3xl mb-2">{role.icon}</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{role.title}</span>
              </div>
            ))}
          </div>

          <h3 className="text-2xl sm:text-4xl font-extrabold text-brand-600">
            So where should YOU begin?
          </h3>

        </section>

        {/* ========================================================================= */}
        {/* SCENE 3 — PATHPILOT'S ANSWER & ADAPTIVE STAIRCASE EXPERIENCE */}
        {/* ========================================================================= */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center py-24">
          
          <span className="px-4 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-widest mb-6">
            CHAPTER 2 — THE ANSWER
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-tight mb-6">
            Tell PathPilot where you want to go.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mb-12">
            PathPilot maps current industry expectations, assesses your skill gaps, and visualizes your progress as an interactive staircase adventure.
          </p>

          {/* Interactive Preview Cards */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-14">
            
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-900 text-lg mb-2">1. Market Intelligence</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dynamic skill maps updated for current tech industry role expectations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-900 text-lg mb-2">2. Anime Staircase</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Watch your hero character climb step-by-step as you complete skill milestones.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-900 text-lg mb-2">3. Adaptive AI Engine</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Path recalculates continuously as you learn and master weak skill areas.
              </p>
            </div>

          </div>

          {/* Final CTA */}
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={handleStart}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-105 text-white font-black text-xl shadow-glow-celestial transition-all flex items-center space-x-3 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <span className="text-xs font-extrabold text-slate-400">
              Free to access • No payment required
            </span>
          </div>

        </section>

      </div>

    </div>
  );
};
