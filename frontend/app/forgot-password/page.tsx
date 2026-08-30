'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send reset link');
      }
      setSuccess(true);
      if (data.reset_token_for_demo) {
        setDemoToken(data.reset_token_for_demo);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 font-bold text-2xl tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
        PathPilot<span className="text-[#007AFF]">.</span>
      </Link>

      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">Reset Password</h1>
          <p className="text-[#86868B] text-sm mt-2">
            Enter your email to receive a password reset link.
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
                <p className="font-medium text-[#34C759]">Reset email sent!</p>
                <p className="mt-1">Check your inbox for the next steps.</p>
              </div>
            </div>
            
            {demoToken && (
              <div className="p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] text-sm">
                <p className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Hackathon Demo Notice:</p>
                <p className="text-[#6E6E73] dark:text-[#AEAEB2] mb-3">Since this is a demo environment without an email server, you can use this link to reset your password:</p>
                <Link 
                  href={`/reset-password?token=${demoToken}`}
                  className="text-[#007AFF] hover:underline font-medium break-all"
                >
                  Click here to reset your password
                </Link>
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/login'}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-[#D2D2D7] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm font-medium text-[#007AFF] hover:text-[#006EDB] transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
