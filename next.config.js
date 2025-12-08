/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {

    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'vobyofrvnrzcadgocicy.supabase.co' }
    ]
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true
};

module.exports = nextConfig;
