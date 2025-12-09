'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  isAdmin: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  const fetchUserProfile = async (authUser: SupabaseUser): Promise<User | null> => {
    try {
      // Get user profile from users table
      let { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      // If user doesn't exist in users table, create one
      if (error || !dbUser) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email,
            phone: authUser.user_metadata?.phone || '',
            is_admin: false
          })
          .select()
          .single();

        if (createError || !newUser) {
          console.error('Error creating user profile:', createError);
          return null;
        }
        dbUser = newUser;
      }

      // Check if user is admin
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', dbUser.id)
        .single();

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email || '',
        phone: dbUser.phone || '',
        isAdmin: dbUser.is_admin || !!adminData,
        createdAt: new Date(dbUser.created_at)
      };
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await fetchUserProfile(authUser);
      setUser(profile);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user);
          setUser(profile);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login with email and password
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use API endpoint for login (more reliable with service role key)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Login failed' };
      }

      // Set session in Supabase client if tokens are returned
      if (result.session?.access_token && result.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token
        });
      }

      // Fetch user profile
      if (result.user) {
        // Get full profile from database
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        // Check if admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', dbUser?.id)
          .maybeSingle();

        const profile: User = {
          id: dbUser?.id || result.user.id,
          name: dbUser?.name || result.user.name || email.split('@')[0],
          email: email,
          phone: dbUser?.phone || '',
          isAdmin: dbUser?.is_admin || !!adminData,
          createdAt: new Date(dbUser?.created_at || Date.now())
        };

        setUser(profile);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Register new user
  const register = async (data: { name: string; email: string; phone: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use API to create user with auto-confirmation
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Registration failed' };
      }

      // Now sign in the user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (signInError) {
        console.error('Auto sign-in error:', signInError);
        // Registration succeeded but auto-login failed - user can manually login
        return { success: true };
      }

      if (authData.user) {
        const profile = await fetchUserProfile(authData.user);
        setUser(profile);
      }

      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Update profile
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name,
          phone: data.phone
        })
        .eq('id', user.id);

      if (!error) {
        setUser(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
