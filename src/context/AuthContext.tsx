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

  // Fetch user profile with cross-verification between Clerk and Supabase
  const fetchUserProfile = async (clerkUserId: string, clerkUserData: any): Promise<User | null> => {
    try {
      console.log('🔍 Fetching user profile for Clerk ID:', clerkUserId);
      
      // Step 1: Get user from Supabase by Clerk ID
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, name, email, phone, is_admin, admin_source, created_at, clerk_user_id, last_synced_at')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      console.log('📊 Supabase user found:', dbUser);

      // Step 2: Cross-verify admin status between Clerk and Supabase
      const clerkIsAdmin = checkClerkAdminStatus(clerkUserData);
      const supabaseIsAdmin = dbUser?.is_admin || false;

      console.log('🔐 Admin status verification:', {
        clerk_admin: clerkIsAdmin,
        supabase_admin: supabaseIsAdmin,
        clerk_metadata: clerkUserData?.publicMetadata
      });

      // Step 3: Determine final admin status (both must agree OR auto-sync)
      let finalAdminStatus = false;
      let adminReason = 'not_admin';

      if (clerkIsAdmin && supabaseIsAdmin) {
        finalAdminStatus = true;
        adminReason = 'both_systems_confirm';
        console.log('✅ Admin access granted: Both Clerk and Supabase confirm admin status');
      } else if (clerkIsAdmin && !supabaseIsAdmin) {
        // Clerk says admin but Supabase doesn't - trigger sync
        console.log('🔄 Admin status mismatch: Clerk=admin, Supabase=user. Triggering sync...');
        await syncAdminStatusToSupabase(clerkUserId, clerkUserData, true);
        finalAdminStatus = true;
        adminReason = 'clerk_admin_synced';
      } else if (!clerkIsAdmin && supabaseIsAdmin) {
        // Supabase says admin but Clerk doesn't - respect Clerk (more authoritative)
        console.log('⚠️  Admin status mismatch: Supabase=admin, Clerk=user. Respecting Clerk status.');
        await syncAdminStatusToSupabase(clerkUserId, clerkUserData, false);
        finalAdminStatus = false;
        adminReason = 'clerk_revoked_admin';
      }

      if (dbUser) {
        const userProfile = {
          id: dbUser.id,
          name: dbUser.name || clerkUserData?.fullName || clerkUserData?.firstName || 'User',
          email: dbUser.email || clerkUserData?.primaryEmailAddress?.emailAddress || '',
          phone: dbUser.phone || clerkUserData?.primaryPhoneNumber?.phoneNumber || '',
          isAdmin: finalAdminStatus,
          createdAt: new Date(dbUser.created_at || Date.now())
        };
        
        console.log(`🎯 Final user profile (Admin: ${finalAdminStatus}, Reason: ${adminReason}):`, userProfile);
        return userProfile;
      }

      // Step 4: User not found by Clerk ID - try email linking
      const email = clerkUserData?.primaryEmailAddress?.emailAddress;
      if (email) {
        console.log('🔗 User not found by Clerk ID, trying email linking:', email);
        
        const { data: emailUser } = await supabase
          .from('users')
          .select('id, name, email, phone, is_admin, created_at, clerk_user_id')
          .eq('email', email)
          .maybeSingle();

        if (emailUser && !emailUser.clerk_user_id) {
          console.log('🔗 Found existing user by email, linking with Clerk ID');
          
          // Determine admin status for linking
          const linkAdminStatus = clerkIsAdmin || emailUser.is_admin;
          
          const { data: updatedUser } = await supabase
            .from('users')
            .update({ 
              clerk_user_id: clerkUserId,
              is_admin: linkAdminStatus,
              admin_source: clerkIsAdmin ? 'clerk_metadata' : 'existing_database',
              last_synced_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
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
            console.log('✅ Successfully linked user with admin status:', linkedProfile.isAdmin);
            return linkedProfile;
          }
        }
      }

      // Step 5: Create new user if not found anywhere
      console.log('🆕 User not found in Supabase, creating new user');
      const newUserAdminStatus = clerkIsAdmin;
      
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          email: clerkUserData?.primaryEmailAddress?.emailAddress || '',
          name: clerkUserData?.fullName || clerkUserData?.firstName || 'User',
          phone: clerkUserData?.primaryPhoneNumber?.phoneNumber || '',
          is_admin: newUserAdminStatus,
          admin_source: newUserAdminStatus ? 'clerk_metadata' : 'none',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString()
        })
        .select('id, name, email, phone, is_admin, created_at')
        .single();

      if (newUser) {
        console.log('✅ Created new user with admin status:', newUser.is_admin);
        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || '',
          isAdmin: newUser.is_admin,
          createdAt: new Date(newUser.created_at)
        };
      }

      // Final fallback to Clerk data only
      console.log('⚠️  Fallback to Clerk-only profile');
      return {
        id: clerkUserId,
        name: clerkUserData?.fullName || clerkUserData?.firstName || 'User',
        email: clerkUserData?.primaryEmailAddress?.emailAddress || '',
        phone: clerkUserData?.primaryPhoneNumber?.phoneNumber || '',
        isAdmin: false, // No admin access without database confirmation
        createdAt: new Date()
      };
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      
      // Error fallback - no admin access
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

  // Helper function to check Clerk admin status
  const checkClerkAdminStatus = (clerkUserData: any): boolean => {
    if (!clerkUserData) return false;
    
    const publicMeta = clerkUserData.publicMetadata || {};
    const privateMeta = clerkUserData.privateMetadata || {};
    const unsafeMeta = clerkUserData.unsafeMetadata || {};
    
    return !!(
      publicMeta.isAdmin === true ||
      publicMeta.role === 'admin' ||
      privateMeta.isAdmin === true ||
      privateMeta.role === 'admin' ||
      unsafeMeta.isAdmin === true ||
      unsafeMeta.role === 'admin'
    );
  };

  // Helper function to sync admin status to Supabase
  const syncAdminStatusToSupabase = async (clerkUserId: string, clerkUserData: any, isAdmin: boolean) => {
    try {
      await supabase
        .from('users')
        .update({
          is_admin: isAdmin,
          admin_source: isAdmin ? 'clerk_metadata' : 'clerk_revoked',
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('clerk_user_id', clerkUserId);
      
      console.log(`🔄 Synced admin status to Supabase: ${isAdmin ? 'GRANTED' : 'REVOKED'}`);
    } catch (error) {
      console.error('❌ Failed to sync admin status to Supabase:', error);
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
