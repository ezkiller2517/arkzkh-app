// /next.config.ts  (project root in Firebase Studio)

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 🔑 Required for Firebase App Hosting (runs your app as a Node server)
  output: 'standalone',

  // Nice-to-haves
  reactStrictMode: true,

  // Keep your existing build relaxations
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Keep your existing image allowlist
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
    ],
  },
};

export default nextConfig;
