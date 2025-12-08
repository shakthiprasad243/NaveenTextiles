/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML export for GitHub Pages
  trailingSlash: true, // Required for GitHub Pages
  images: {
    unoptimized: true, // Required for static export
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
