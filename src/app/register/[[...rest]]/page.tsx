import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up | Naveen Textiles',
  description: 'Create your Naveen Textiles account'
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Image 
                src="/logo.png" 
                alt="Naveen Textiles" 
                width={80} 
                height={80} 
                className="h-16 md:h-20 w-auto rounded-lg"
              />
              <span className="text-lg md:text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-500">
                Naveen Textiles
              </span>
            </div>
          </Link>
          <h1 className="text-xl md:text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-500">
            Create Account
          </h1>
          <p className="text-dark-400 mt-2 text-sm">
            Join Naveen Textiles today
          </p>
        </div>

        <div className="flex justify-center">
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('YOUR_DEVELOPMENT') ? (
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "glass-card-gold rounded-xl shadow-xl border-0 w-full max-w-none",
                  headerTitle: "text-white font-serif text-lg md:text-xl",
                  headerSubtitle: "text-dark-400 text-sm",
                  socialButtonsBlockButton: "glass-card hover:glass-card-hover border-0 text-white min-h-[48px] text-base",
                  socialButtonsBlockButtonText: "text-white text-sm md:text-base",
                  dividerLine: "bg-dark-600",
                  dividerText: "text-dark-400 text-sm",
                  formFieldLabel: "text-dark-300 text-sm md:text-base",
                  formFieldInput: "glass-card border-0 text-white placeholder-dark-500 focus:ring-1 focus:ring-primary/50 min-h-[48px] text-base px-4 py-3",
                  footerActionLink: "text-primary hover:text-primary-light text-sm md:text-base",
                  formButtonPrimary: "btn-glossy text-dark-900 hover:opacity-90 min-h-[48px] text-base font-medium",
                  identityPreviewText: "text-white text-sm md:text-base",
                  identityPreviewEditButton: "text-primary hover:text-primary-light text-sm",
                  formFieldInputShowPasswordButton: "text-dark-400 hover:text-white min-w-[44px] min-h-[44px]",
                  otpCodeFieldInput: "glass-card border-0 text-white text-center min-h-[48px] text-lg",
                  formResendCodeLink: "text-primary hover:text-primary-light text-sm",
                  phoneInputBox: "glass-card border-0 text-white min-h-[48px]",
                  selectButton: "glass-card border-0 text-white min-h-[48px] hover:bg-primary/10"
                },
                layout: {
                  socialButtonsPlacement: "top"
                }
              }}
            />
          ) : (
            <div className="glass-card-gold rounded-xl p-6 md:p-8 text-center w-full">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium text-lg mb-2">Registration Disabled</h3>
                <p className="text-dark-400 text-sm mb-4">
                  Account creation is currently disabled for development. The app is running in test mode.
                </p>
                <div className="space-y-2 text-xs text-dark-500">
                  <p>To enable registration:</p>
                  <p>1. Get development keys from Clerk Dashboard</p>
                  <p>2. Update .env.local with valid keys</p>
                  <p>3. Restart the development server</p>
                </div>
              </div>
              <Link 
                href="/" 
                className="btn-glossy px-6 py-3 rounded-lg text-sm font-medium text-dark-900 inline-flex items-center gap-2"
              >
                Continue to Store
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-dark-300 text-xs mt-4 md:mt-6 leading-relaxed">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary-light">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary hover:text-primary-light">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}