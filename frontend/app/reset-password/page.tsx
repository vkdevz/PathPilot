'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reset password');
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">Create New Password</h1>
        <p className="text-[#86868B] text-sm mt-2">
          Enter a new secure password for your account.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#FFF0EF] border border-[#FF3B30]/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#FF3B30] shrink-0 mt-0.5" />
          <p className="text-sm text-[#FF3B30] font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {success ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#EAF8EE] border border-[#34C759]/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5" />
            <div className="text-sm text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
              <p className="font-medium text-[#34C759]">Password Reset Successfully!</p>
              <p className="mt-1">Redirecting to login...</p>
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Go to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 rounded-xl border border-[#D2D2D7] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 rounded-xl border border-[#D2D2D7] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            disabled={!token}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Reset Password
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 font-bold text-2xl tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
        PathPilot<span className="text-[#007AFF]">.</span>
      </Link>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
