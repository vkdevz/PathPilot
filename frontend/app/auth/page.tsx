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
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm surface-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        {/* Header Identity */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#007AFF] flex items-center justify-center shadow-sm group-hover:bg-[#006EDB] transition-colors">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">PathPilot</span>
          </Link>

          <h1 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {isSignUp ? 'Create Learner Account' : 'Sign in to PathPilot'}
          </h1>
          <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
            {isSignUp ? 'Begin your calibrated learning journey' : 'Access your active roadmap and skill diagnostics'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-[#FFF0EF] border border-[#FF3B30]/20 text-[#FF3B30] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-[#6E6E73] dark:text-[#AEAEB2]">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required={isSignUp}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] text-xs focus:outline-none focus:border-[#007AFF]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[#6E6E73] dark:text-[#AEAEB2]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] text-xs focus:outline-none focus:border-[#007AFF]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[#6E6E73] dark:text-[#AEAEB2]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] text-xs focus:outline-none focus:border-[#007AFF]"
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
            className="text-xs text-[#007AFF] hover:text-[#006EDB] transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-[#E5E5EA] dark:border-[#38383A] space-y-2">
          <div className="text-[10px] uppercase font-semibold text-[#86868B] text-center tracking-wider">
            Quick Demo Profiles
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('data_scientist')}
              className="p-2 bg-[#FBFBFD] dark:bg-[#2C2C2E] hover:bg-[#F5F5F7] dark:hover:bg-[#38383A] border border-[#E5E5EA] dark:border-[#38383A] rounded-lg text-[11px] text-[#1D1D1F] dark:text-[#F5F5F7] text-left transition-colors cursor-pointer"
            >
              🧙 Data Scientist
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ai_engineer')}
              className="p-2 bg-[#FBFBFD] dark:bg-[#2C2C2E] hover:bg-[#F5F5F7] dark:hover:bg-[#38383A] border border-[#E5E5EA] dark:border-[#38383A] rounded-lg text-[11px] text-[#1D1D1F] dark:text-[#F5F5F7] text-left transition-colors cursor-pointer"
            >
              ⚡ AI Engineer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
