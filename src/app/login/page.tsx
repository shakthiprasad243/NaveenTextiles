'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const { login, register } = useAuth();
  const router = useRouter();

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setSuccess(true);
          // Small delay to show success state before redirect
          setTimeout(() => {
            router.push('/account');
            router.refresh();
          }, 500);
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        if (!formData.name || !formData.phone) {
          setError('Please fill all fields');
          setIsLoading(false);
          return;
        }
        const result = await register(formData);
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            router.push('/account');
            router.refresh();
          }, 500);
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="flex items-center justify-center gap-3">
              <Image 
                src="/logo.png" 
                alt="Naveen Textiles" 
                width={80} 
                height={80} 
                className="h-20 w-auto rounded-lg"
              />
              <span className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-500">
                Naveen Textiles
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-500">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-dark-400 mt-2 text-sm">
            {isLogin ? 'Sign in to your account' : 'Join Naveen Textiles today'}
          </p>
        </div>

        <div className="glass-card-gold rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-dark-300 text-sm mb-2 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-dark-300 text-sm mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-dark-300 text-sm mb-2 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-dark-300 text-sm mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            {success && (
              <p className="text-green-400 text-sm text-center">Login Successful! Redirecting...</p>
            )}

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full btn-glossy py-3 rounded-lg text-sm font-medium text-dark-900 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : success ? (
                'Success!'
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-primary hover:text-primary-light ml-2"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-dark-500 text-xs mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary-light">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary hover:text-primary-light">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
