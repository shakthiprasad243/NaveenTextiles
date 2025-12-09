'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.name || !formData.phone || !formData.email || !formData.password) {
        setError('Please fill all fields');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      const result = await register(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/account');
        }, 1500);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="glass-card-gold rounded-xl p-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-serif text-white mb-2">Registration Successful!</h2>
            <p className="text-dark-400 text-sm">Welcome to Naveen Textiles. Redirecting to your account...</p>
          </div>
        </div>
      </div>
    );
  }

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
            Create Account
          </h1>
          <p className="text-dark-400 mt-2 text-sm">
            Join Naveen Textiles today
          </p>
        </div>

        <div className="glass-card-gold rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-dark-300 text-sm mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
                  placeholder="Enter your name"
                />
              </div>
            </div>

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

            <div>
              <label className="text-dark-300 text-sm mb-2 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="text-dark-300 text-sm mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
                  placeholder="Create a password (min 6 characters)"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-glossy py-3 rounded-lg text-sm font-medium text-dark-900 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400 text-sm">
              Already have an account?
              <Link href="/login" className="text-primary hover:text-primary-light ml-2">
                Sign In
              </Link>
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
