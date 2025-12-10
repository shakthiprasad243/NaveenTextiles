'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { pageview, GA_TRACKING_ID } from '@/lib/gtag';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_TRACKING_ID) return;

    // Track page view on route change
    pageview(pathname);
  }, [pathname]);

  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        onLoad={() => {
          // Initialize gtag after script loads
          if (typeof window !== 'undefined' && GA_TRACKING_ID) {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag() {
              window.dataLayer.push(arguments);
            };
            window.gtag('js', new Date());
            window.gtag('config', GA_TRACKING_ID, {
              page_path: window.location.pathname,
            });
          }
        }}
      />
    </>
  );
}