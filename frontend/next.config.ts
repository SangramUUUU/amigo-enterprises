import type { NextConfig } from "next";

const backendPort = process.env.BACKEND_PORT || "4020";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.VERCEL) return [];
    return [
      {
        source: "/api/:path*",
        destination: `http://localhost:${backendPort}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
