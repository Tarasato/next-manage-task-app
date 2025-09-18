import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ifgebbwhvrcvcygkytta.supabase.co',
      },
    ],
  },
};

export default nextConfig;
