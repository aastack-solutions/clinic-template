import type { NextConfig } from 'next';

/**
 * The engine powers many different clinics, and every clinic brings its own
 * asset host (CDN, CMS, Google Storage, Unsplash...). Rather than editing this
 * file per clinic, remote images are allowed over HTTPS from any host and the
 * `<SmartImage />` component degrades gracefully when a URL is unreachable.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
