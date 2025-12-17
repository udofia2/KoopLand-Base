import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pino", "thread-stream"],
  },
};

export default nextConfig;
