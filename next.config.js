/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'vobyofrvnrzcadgocicy.supabase.co' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' }
    ]
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true
};

module.exports = nextConfig;
