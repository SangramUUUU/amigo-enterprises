import type { NextConfig } from "next";

const backendHost = process.env.BACKEND_HOST || "127.0.0.1";
const backendPort = process.env.BACKEND_PORT || "4020";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.VERCEL) return { beforeFiles: [], afterFiles: [], fallback: [] };
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `http://${backendHost}:${backendPort}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
