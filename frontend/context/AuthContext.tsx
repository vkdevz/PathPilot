'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
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

  const fetchBackendUser = async () => {
    try {
      const backendUser = await apiClient.getMe();
      setUser(backendUser);
    } catch (err) {
      console.warn('Backend user profile not yet initialized or offline:', err);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchBackendUser().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchBackendUser();
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string = 'Password123!') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user does not exist in mock/dev environment, auto sign-up
        if (error.message.includes('Invalid login credentials')) {
          await signUpWithEmail(email, password, email.split('@')[0]);
          return;
        }
        throw error;
      }

      setSupabaseUser(data.user);
      await fetchBackendUser();
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string = 'Password123!', displayName: string = 'Learner') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
          },
        },
      });

      if (error) throw error;
      setSupabaseUser(data.user);
      if (data.session) {
        await fetchBackendUser();
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pathpilot_token');
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
