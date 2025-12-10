'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

export default function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const skipAuth = process.env.SKIP_AUTH === 'true';

  // If SKIP_AUTH is true or no valid Clerk key, render without ClerkProvider
  if (skipAuth || !publishableKey || publishableKey.includes('YOUR_DEVELOPMENT')) {
    return <>{children}</>;
  }

  // Otherwise, use ClerkProvider normally
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}