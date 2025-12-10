'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

export default function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // If no Clerk key is available (e.g., during build), render children without Clerk
  if (!publishableKey) {
    console.warn('Clerk publishable key not found, running without authentication');
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}