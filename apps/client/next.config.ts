import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/types'],
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
