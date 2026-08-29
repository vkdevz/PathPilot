'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export default function AuthPage() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, user, supabaseUser, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (!loading && (user || supabaseUser)) {
      router.push('/dashboard');
    }
  }, [loading, user, supabaseUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName || 'Learner');
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: string) => {
    setErrorMsg(null);
    const demoEmail = `${demoRole.toLowerCase()}@pathpilot.ai`;
    setEmail(demoEmail);
    setPassword('DemoPassword123!');
    setSubmitting(true);
    try {
      await signInWithEmail(demoEmail, 'DemoPassword123!');
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen surface-base text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-sm surface-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header Identity */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-500 transition-colors">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">PathPilot</span>
          </Link>

          <h1 className="text-lg font-bold text-white tracking-tight">
            {isSignUp ? 'Create Learner Account' : 'Sign in to PathPilot'}
          </h1>
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Begin your calibrated learning journey' : 'Access your active roadmap and skill diagnostics'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-400">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required={isSignUp}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={submitting}
            className="w-full mt-2"
          >
            <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </form>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <div className="text-[10px] uppercase font-semibold text-slate-500 text-center tracking-wider">
            Quick Demo Profiles
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('data_scientist')}
              className="p-2 bg-slate-950/60 hover:bg-slate-900 border border-white/[0.06] rounded-md text-[11px] text-slate-300 text-left transition-colors"
            >
              🧙 Data Scientist
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ai_engineer')}
              className="p-2 bg-slate-950/60 hover:bg-slate-900 border border-white/[0.06] rounded-md text-[11px] text-slate-300 text-left transition-colors"
            >
              ⚡ AI Engineer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
