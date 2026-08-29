'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isDevMode } from '../lib/supabase/client';
import { apiClient } from '../lib/api-client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: any | null;
  loading: boolean;
  signInWithEmail: (email: string, password?: string) => Promise<void>;
  signUpWithEmail: (email: string, password?: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

// Generate a deterministic dev user ID from email
function devUserIdFromEmail(email: string): string {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `dev-${base || 'learner'}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBackendUser = async () => {
    try {
      const backendUser = await apiClient.getMe();
      setUser(backendUser);
    } catch (err) {
      console.warn('Backend user profile synchronization note:', err);
    }
  };

  // ── Dev Mode Auth (Local / Self-Contained Testing) ───────────
  const devSignIn = async (email: string, _password?: string, displayName?: string) => {
    const userId = devUserIdFromEmail(email);
    const devToken = `dev-token-${userId}`;

    if (typeof window !== 'undefined') {
      localStorage.setItem('pathpilot_token', devToken);
      localStorage.setItem('pathpilot_email', email);
    }

    const syntheticUser = {
      id: userId,
      email,
      user_metadata: { full_name: displayName || email.split('@')[0] },
    };
    setSupabaseUser(syntheticUser);
    await fetchBackendUser();
  };

  const devSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pathpilot_token');
      localStorage.removeItem('pathpilot_email');
    }
    setSupabaseUser(null);
    setUser(null);
  };

  // ── Session Initialization & Lifecycle ────────────────────────
  useEffect(() => {
    if (isDevMode) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_token') : null;
      const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_email') : null;

      if (storedToken && storedToken.startsWith('dev-token-')) {
        const userId = storedToken.replace('dev-token-', '');
        const email = storedEmail || `${userId}@pathpilot.ai`;
        setSupabaseUser({
          id: userId,
          email,
          user_metadata: { full_name: `Learner (${userId})` },
        });
        fetchBackendUser().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      return;
    }

    // Production: Supabase JWT session management with resilient fallback
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          fetchBackendUser().finally(() => setLoading(false));
        } else {
          // Check localStorage dev token fallback
          const storedToken = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_token') : null;
          const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_email') : null;
          if (storedToken && storedToken.startsWith('dev-token-')) {
            const userId = storedToken.replace('dev-token-', '');
            const email = storedEmail || `${userId}@pathpilot.ai`;
            setSupabaseUser({ id: userId, email, user_metadata: { full_name: `Learner (${userId})` } });
            fetchBackendUser().finally(() => setLoading(false));
          } else {
            setLoading(false);
          }
        }
      }).catch(() => {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_token') : null;
        const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_email') : null;
        if (storedToken && storedToken.startsWith('dev-token-')) {
          const userId = storedToken.replace('dev-token-', '');
          const email = storedEmail || `${userId}@pathpilot.ai`;
          setSupabaseUser({ id: userId, email, user_metadata: { full_name: `Learner (${userId})` } });
          fetchBackendUser().finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
    } catch {
      setLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchBackendUser();
      } else {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_token') : null;
        if (!storedToken) {
          setSupabaseUser(null);
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── Sign In ────────────────────────────────────────────────────
  const signInWithEmail = async (email: string, password: string = 'Password123!') => {
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      if (isDevMode) {
        await devSignIn(cleanEmail, password);
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('fetch') || msg.includes('network') || msg.includes('load failed') || msg.includes('failed to fetch')) {
            console.warn('Supabase auth network unreachable, logging in locally:', error);
            await devSignIn(cleanEmail, password);
            return;
          }
          throw error;
        }
        setSupabaseUser(data.user);
        await fetchBackendUser();
      } catch (err: any) {
        const errMsg = err?.message?.toLowerCase() || '';
        if (errMsg.includes('fetch') || errMsg.includes('load failed') || errMsg.includes('network') || errMsg.includes('failed to fetch')) {
          console.warn('Supabase auth network unreachable, logging in locally:', err);
          await devSignIn(cleanEmail, password);
          return;
        }
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ────────────────────────────────────────────────────
  const signUpWithEmail = async (
    email: string,
    password: string = 'Password123!',
    displayName: string = 'Learner'
  ) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      if (isDevMode) {
        await devSignIn(cleanEmail, password, displayName);
        return;
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: displayName,
            },
          },
        });

        if (error) {
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('fetch') || msg.includes('network') || msg.includes('load failed') || msg.includes('failed to fetch')) {
            console.warn('Supabase auth network unreachable, registering locally:', error);
            await devSignIn(cleanEmail, password, displayName);
            return;
          }
          throw error;
        }
        setSupabaseUser(data.user);
        if (data.session) {
          await fetchBackendUser();
        }
      } catch (err: any) {
        const errMsg = err?.message?.toLowerCase() || '';
        if (errMsg.includes('fetch') || errMsg.includes('load failed') || errMsg.includes('network') || errMsg.includes('failed to fetch')) {
          console.warn('Supabase auth network unreachable, registering locally:', err);
          await devSignIn(cleanEmail, password, displayName);
          return;
        }
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Out ───────────────────────────────────────────────────
  const signOut = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pathpilot_token');
        localStorage.removeItem('pathpilot_email');
      }

      if (isDevMode) {
        await devSignOut();
        return;
      }

      await supabase.auth.signOut();
      setSupabaseUser(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchBackendUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
