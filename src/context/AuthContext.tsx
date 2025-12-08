'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo passwords (in production, use proper auth)
const DEMO_PASSWORDS: Record<string, string> = {
  'admin@naveentextiles.com': 'admin123',
  'ravi@example.com': 'user123'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('naveen_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({
          ...parsed,
          createdAt: new Date(parsed.createdAt)
        });
      } catch {
        localStorage.removeItem('naveen_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check demo password
      const expectedPassword = DEMO_PASSWORDS[email];
      if (expectedPassword && password !== expectedPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Try to find user in Supabase
      const { data: dbUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError || !dbUser) {
        // Fallback to demo users for testing
        if (email === 'admin@naveentextiles.com' && password === 'admin123') {
          const adminUser: User = {
            id: 'admin-1',
            name: 'Admin User',
            email: 'admin@naveentextiles.com',
            phone: '9876543210',
            address: '123, Textile Market, Surat',
            isAdmin: true,
            createdAt: new Date('2024-01-01')
          };
          setUser(adminUser);
          localStorage.setItem('naveen_user', JSON.stringify(adminUser));
          return { success: true };
        }
        if (email === 'ravi@example.com' && password === 'user123') {
          const demoUser: User = {
            id: 'user-1',
            name: 'Ravi Kumar',
            email: 'ravi@example.com',
            phone: '9876543211',
            address: '456, MG Road, Bangalore',
            isAdmin: false,
            createdAt: new Date('2024-06-15')
          };
          setUser(demoUser);
          localStorage.setItem('naveen_user', JSON.stringify(demoUser));
          return { success: true };
        }
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user is admin
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', dbUser.id)
        .single();

      const loggedInUser: User = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email || '',
        phone: dbUser.phone,
        isAdmin: dbUser.is_admin || !!adminData,
        createdAt: new Date(dbUser.created_at)
      };

      setUser(loggedInUser);
      localStorage.setItem('naveen_user', JSON.stringify(loggedInUser));
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if email exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Check if phone exists
      const { data: existingPhone } = await supabase
        .from('users')
        .select('id')
        .eq('phone', data.phone)
        .single();

      if (existingPhone) {
        return { success: false, error: 'Phone number already registered' };
      }

      // Create new user
      const { data: newDbUser, error: createError } = await supabase
        .from('users')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          is_admin: false
        })
        .select()
        .single();

      if (createError || !newDbUser) {
        return { success: false, error: 'Registration failed. Please try again.' };
      }

      const newUser: User = {
        id: newDbUser.id,
        name: newDbUser.name,
        email: newDbUser.email || '',
        phone: newDbUser.phone,
        isAdmin: false,
        createdAt: new Date(newDbUser.created_at)
      };

      setUser(newUser);
      localStorage.setItem('naveen_user', JSON.stringify(newUser));
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('naveen_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name,
          phone: data.phone
        })
        .eq('id', user.id);

      if (!error) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('naveen_user', JSON.stringify(updatedUser));
      }
    } catch {
      // Still update locally even if Supabase fails
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('naveen_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
