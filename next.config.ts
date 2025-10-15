import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 🔑 Required for Firebase App Hosting (runs Next as a Node server)
  output: 'standalone',
  reactStrictMode: true,

  // keep your existing build settings
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
};

export default nextConfig;
