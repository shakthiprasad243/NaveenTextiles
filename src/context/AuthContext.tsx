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
  const skipAuth = process.env.SKIP_AUTH === 'true';
  const hasClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('YOUR_DEVELOPMENT');

  // Only use Clerk hooks if we have valid keys and not skipping auth
  const clerkHooks = hasClerkKey && !skipAuth ? {
    user: useUser().user,
    isLoaded: useUser().isLoaded,
    signOut: useClerk().signOut
  } : {
    user: null,
    isLoaded: true,
    signOut: async () => {}
  };

  const { user: clerkUser, isLoaded, signOut } = clerkHooks;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Always start with loading true to prevent hydration mismatch

  // Fetch user profile from Supabase using Clerk user ID
  const fetchUserProfile = async (clerkUserId: string, clerkUserData: any): Promise<User | null> => {
    try {
      console.log('Fetching user profile for Clerk ID:', clerkUserId);
      
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, name, email, phone, is_admin, created_at, clerk_user_id')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      console.log('Supabase user found:', dbUser);

      if (dbUser) {
        const userProfile = {
          id: dbUser.id,
          name: dbUser.name || clerkUserData?.fullName || clerkUserData?.firstName || 'User',
          email: dbUser.email || clerkUserData?.primaryEmailAddress?.emailAddress || '',
          phone: dbUser.phone || clerkUserData?.primaryPhoneNumber?.phoneNumber || '',
          isAdmin: dbUser.is_admin || false,
          createdAt: new Date(dbUser.created_at || Date.now())
        };
        console.log('Returning user profile with admin status:', userProfile.isAdmin);
        return userProfile;
      }

      // If user not found by Clerk ID, try to find by email and link
      const email = clerkUserData?.primaryEmailAddress?.emailAddress;
      if (email) {
        console.log('User not found by Clerk ID, trying email:', email);
        
        const { data: emailUser } = await supabase
          .from('users')
          .select('id, name, email, phone, is_admin, created_at, clerk_user_id')
          .eq('email', email)
          .maybeSingle();

        if (emailUser) {
          console.log('Found user by email, linking with Clerk ID:', emailUser);
          
          // Update the user record to link with Clerk ID
          const { data: updatedUser } = await supabase
            .from('users')
            .update({ clerk_user_id: clerkUserId })
            .eq('email', email)
            .select('id, name, email, phone, is_admin, created_at')
            .single();

          if (updatedUser) {
            const linkedProfile = {
              id: updatedUser.id,
              name: updatedUser.name || clerkUserData?.fullName || clerkUserData?.firstName || 'User',
              email: updatedUser.email || email,
              phone: updatedUser.phone || clerkUserData?.primaryPhoneNumber?.phoneNumber || '',
              isAdmin: updatedUser.is_admin || false,
              createdAt: new Date(updatedUser.created_at || Date.now())
            };
            console.log('Successfully linked and returning profile with admin status:', linkedProfile.isAdmin);
            return linkedProfile;
          }
        }
      }

      // If user not found in Supabase, return basic profile from Clerk
      console.log('User not found in Supabase, returning basic Clerk profile');
      return {
        id: clerkUserId,
        name: clerkUserData?.fullName || clerkUserData?.firstName || 'User',
        email: clerkUserData?.primaryEmailAddress?.emailAddress || '',
        phone: clerkUserData?.primaryPhoneNumber?.phoneNumber || '',
        isAdmin: false,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Fallback to Clerk data
      return {
        id: clerkUserId,
        name: clerkUserData?.fullName || clerkUserData?.firstName || 'User',
        email: clerkUserData?.primaryEmailAddress?.emailAddress || '',
        phone: clerkUserData?.primaryPhoneNumber?.phoneNumber || '',
        isAdmin: false,
        createdAt: new Date()
      };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (clerkUser?.id) {
      console.log('Refreshing user data for:', clerkUser.id);
      const profile = await fetchUserProfile(clerkUser.id, clerkUser);
      setUser(profile);
    }
  };

  // Initialize auth state based on Clerk user or skip auth
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // If skipping auth, set loading to false immediately
      if (skipAuth || !hasClerkKey) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Wait for Clerk to be loaded before proceeding
      if (!isLoaded) {
        return;
      }

      try {
        if (clerkUser?.id && mounted) {
          console.log('Initializing auth for user:', clerkUser.id);
          const profile = await fetchUserProfile(clerkUser.id, clerkUser);
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
  }, [clerkUser, isLoaded, skipAuth, hasClerkKey]);

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
