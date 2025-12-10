import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import ConditionalClerkProvider from '@/components/ConditionalClerkProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import BackToTop from '@/components/BackToTop';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Naveen Textiles - Premium Fabrics & Clothing | Surat',
    template: '%s | Naveen Textiles'
  },
  description: 'Shop premium quality textiles, sarees, kurtas, fabrics and more at Naveen Textiles, Surat. Where Comfort Meets Confidence. WhatsApp checkout for easy ordering.',
  keywords: ['textiles', 'sarees', 'kurtas', 'fabrics', 'clothing', 'Surat', 'Gujarat', 'Indian wear', 'ethnic wear', 'Naveen Textiles'],
  authors: [{ name: 'Naveen Textiles' }],
  creator: 'Naveen Textiles',
  publisher: 'Naveen Textiles',
  metadataBase: new URL('https://naveentextiles.store'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://naveentextiles.store',
    siteName: 'Naveen Textiles',
    title: 'Naveen Textiles - Premium Fabrics & Clothing',
    description: 'Shop premium quality textiles, sarees, kurtas, fabrics and more. Where Comfort Meets Confidence.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Naveen Textiles Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naveen Textiles - Premium Fabrics & Clothing',
    description: 'Shop premium quality textiles, sarees, kurtas, fabrics and more. Where Comfort Meets Confidence.',
    images: ['/logo.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    // Add your verification codes here after setting up
    // google: 'your-google-verification-code',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConditionalClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" type="image/png" href="/logo.png" />
          <link rel="apple-touch-icon" href="/logo.png" />
          <meta name="theme-color" content="#D4AF37" />
        </head>
        <body className="min-h-screen">
          <GoogleAnalytics />
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="pb-20">{children}</main>
              <Footer />
              <FloatingWhatsApp />
              <BackToTop />
            </CartProvider>
          </AuthProvider>
        </body>
      </html>
    </ConditionalClerkProvider>
  );
}
