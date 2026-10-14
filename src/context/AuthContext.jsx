import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex@productivity.app',
  user_metadata: {
    full_name: 'Alex Johnson',
  },
  isDemo: true,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      // Check if demo user was active
      const storedDemo = localStorage.getItem('productivity_demo_user');
      if (storedDemo) {
        try {
          setUser(JSON.parse(storedDemo));
        } catch {
          setUser(DEMO_USER);
        }
      } else {
        // Default to demo user for instant out-of-the-box experience
        setUser(DEMO_USER);
        localStorage.setItem('productivity_demo_user', JSON.stringify(DEMO_USER));
      }
      setLoading(false);
      return;
    }

    // Supabase is configured
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('Session error:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email, password) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      const demoUser = {
        ...DEMO_USER,
        email,
        user_metadata: { full_name: email.split('@')[0] },
      };
      setUser(demoUser);
      localStorage.setItem('productivity_demo_user', JSON.stringify(demoUser));
      return { data: { user: demoUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  const signUpWithPassword = async (email, password) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      const demoUser = {
        ...DEMO_USER,
        email,
        user_metadata: { full_name: email.split('@')[0] },
      };
      setUser(demoUser);
      localStorage.setItem('productivity_demo_user', JSON.stringify(demoUser));
      return { data: { user: demoUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      const googleDemo = {
        id: 'google-demo-user',
        email: 'google.user@example.com',
        user_metadata: { full_name: 'Google User' },
        isDemo: true,
      };
      setUser(googleDemo);
      localStorage.setItem('productivity_demo_user', JSON.stringify(googleDemo));
      return { data: { user: googleDemo }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      localStorage.removeItem('productivity_demo_user');
      setUser(null);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err) {
      setAuthError(err.message);
      return { error: err };
    }
  };

  const continueAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem('productivity_demo_user', JSON.stringify(DEMO_USER));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authError,
        isConfigured: isSupabaseConfigured,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        signOut,
        continueAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
