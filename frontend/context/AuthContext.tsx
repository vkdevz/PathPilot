'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isDevMode } from '../lib/supabase/client';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserState = (userData: User, token?: string) => {
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('pathpilot_token', token);
      localStorage.setItem('pathpilot_email', userData.email);
    }
    setUser(userData);
    setSupabaseUser({
      id: userData.id,
      email: userData.email,
      user_metadata: { full_name: userData.display_name || userData.email.split('@')[0] },
    });
  };

  const fetchBackendUser = async () => {
    try {
      const backendUser = await apiClient.getMe();
      if (backendUser) {
        syncUserState(backendUser);
        return;
      }
    } catch (err) {
      console.warn('Backend session restoration note:', err);
    }
  };

  // ── Session Initialization & Lifecycle ────────────────────────
  useEffect(() => {
    const initializeSession = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_token') : null;

      if (storedToken) {
        try {
          const backendUser = await apiClient.getMe();
          if (backendUser) {
            syncUserState(backendUser);
            setLoading(false);
            return;
          }
        } catch {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pathpilot_token');
            localStorage.removeItem('pathpilot_email');
          }
        }
      }
      setLoading(false);
    };

    initializeSession();
  }, []);

  // ── Real Sign In (FastAPI Backend + JWT Verification) ─────────
  const signInWithEmail = async (email: string, password: string = 'Password123!') => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      // Real Authentication via backend JWT endpoint
      const { access_token, user: authenticatedUser } = await apiClient.login({
        email: cleanEmail,
        password,
      });

      syncUserState(authenticatedUser, access_token);
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Real Sign Up / Registration (FastAPI Backend + Password Hashing) ──
  const signUpWithEmail = async (
    email: string,
    password: string = 'Password123!',
    displayName: string = 'Learner'
  ) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      // Real Account Registration via backend endpoint
      const { access_token, user: registeredUser } = await apiClient.register({
        email: cleanEmail,
        password,
        displayName: displayName || cleanEmail.split('@')[0],
      });

      syncUserState(registeredUser, access_token);
    } catch (err: any) {
      throw err;
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
