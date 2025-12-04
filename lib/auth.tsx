"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isRecoverySession: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isRecoverySession: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updatePassword: async () => {},
  resetPassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  useEffect(() => {
    // Check URL for recovery token indicators
    const checkRecoverySession = () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(hash.substring(1));
      
      // Check for recovery indicators in URL
      if (hash.includes('type=recovery') || 
          urlParams.get('type') === 'recovery' || 
          hashParams.get('type') === 'recovery') {
        setIsRecoverySession(true);
      }
    };

    checkRecoverySession();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // Clear recovery session on sign out
      // Note: Password updates are handled directly in updatePassword() function
      if (event === 'SIGNED_OUT') {
        setIsRecoverySession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/signin`,
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.user?.confirmation_sent_at) {
      throw new Error('Failed to send confirmation email. Please contact support.');
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
    
    // Check if email is confirmed
    if (data.user && !data.user.email_confirmed_at) {
      throw new Error('Please confirm your email before signing in. Check your inbox for the confirmation email.');
    }
    
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
      data: {
        password_changed: true,
      },
    });

    if (error) {
      throw error;
    }

    // Clear recovery session flag after password update
    setIsRecoverySession(false);

    // Update local user state to reflect metadata change
    if (data?.user) {
      setUser(data.user);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isRecoverySession,
        signUp,
        signIn,
        signOut,
        updatePassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
