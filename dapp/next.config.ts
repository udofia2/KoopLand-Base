import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // serverComponentsExternalPackages: ["pino", "thread-stream"],
  },

  serverExternalPackages: ["mongoose", "bcryptjs", "jsonwebtoken"], // ✅ NEW
};

export default nextConfig;
