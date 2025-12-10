import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in | Naveen Textiles',
  description: 'Sign in to your Naveen Textiles account'
};

export default function LoginPage() {
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
            Welcome Back
          </h1>
          <p className="text-dark-400 mt-2 text-sm">
            Sign in to your account
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "glass-card-gold rounded-xl shadow-xl border-0",
                headerTitle: "text-white font-serif",
                headerSubtitle: "text-dark-400",
                socialButtonsBlockButton: "glass-card hover:glass-card-hover border-0 text-white",
                socialButtonsBlockButtonText: "text-white",
                dividerLine: "bg-dark-600",
                dividerText: "text-dark-400",
                formFieldLabel: "text-dark-300",
                formFieldInput: "glass-card border-0 text-white placeholder-dark-500 focus:ring-1 focus:ring-primary/50",
                footerActionLink: "text-primary hover:text-primary-light",
                formButtonPrimary: "btn-glossy text-dark-900 hover:opacity-90",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-primary hover:text-primary-light"
              }
            }}
          />
        </div>

        <p className="text-center text-dark-300 text-xs mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary-light">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary hover:text-primary-light">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}