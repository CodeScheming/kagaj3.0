import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kagajkokatha.com',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
