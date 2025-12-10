'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

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
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Handle cases where Clerk is not available (e.g., during build)
  let clerkUser, isLoaded, signOut;
  try {
    const userHook = useUser();
    const clerkHook = useClerk();
    clerkUser = userHook.user;
    isLoaded = userHook.isLoaded;
    signOut = clerkHook.signOut;
  } catch (error) {
    // Clerk hooks not available, set defaults
    clerkUser = null;
    isLoaded = true;
    signOut = async () => {};
  }
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from Supabase using Clerk user ID
  const fetchUserProfile = async (clerkUserId: string): Promise<User | null> => {
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, name, email, phone, is_admin, created_at')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name || clerkUser?.fullName || clerkUser?.firstName || 'User',
          email: dbUser.email || clerkUser?.primaryEmailAddress?.emailAddress || '',
          phone: dbUser.phone || clerkUser?.primaryPhoneNumber?.phoneNumber || '',
          isAdmin: dbUser.is_admin || false,
          createdAt: new Date(dbUser.created_at || Date.now())
        };
      }

      // If user not found in Supabase, return basic profile from Clerk
      // The webhook should have created the user, but fallback to basic info
      return {
        id: clerkUserId,
        name: clerkUser?.fullName || clerkUser?.firstName || 'User',
        email: clerkUser?.primaryEmailAddress?.emailAddress || '',
        phone: clerkUser?.primaryPhoneNumber?.phoneNumber || '',
        isAdmin: false,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Fallback to Clerk data
      return {
        id: clerkUserId,
        name: clerkUser?.fullName || clerkUser?.firstName || 'User',
        email: clerkUser?.primaryEmailAddress?.emailAddress || '',
        phone: clerkUser?.primaryPhoneNumber?.phoneNumber || '',
        isAdmin: false,
        createdAt: new Date()
      };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (clerkUser?.id) {
      const profile = await fetchUserProfile(clerkUser.id);
      setUser(profile);
    }
  };

  // Initialize auth state based on Clerk user
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!isLoaded) return;

      try {
        if (clerkUser?.id && mounted) {
          const profile = await fetchUserProfile(clerkUser.id);
          if (mounted) setUser(profile);
        } else {
          if (mounted) setUser(null);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [clerkUser, isLoaded]);

  // Logout using Clerk
  const logout = async () => {
    setUser(null);
    await signOut();
  };

  // Update profile in Supabase
  const updateProfile = async (data: Partial<User>) => {
    if (!user || !clerkUser?.id) return;
    
    // Update UI immediately
    setUser(prev => prev ? { ...prev, ...data } : null);

    // Update DB in background
    try {
      await supabase
        .from('users')
        .update({
          name: data.name,
          phone: data.phone
        })
        .eq('clerk_user_id', clerkUser.id);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
