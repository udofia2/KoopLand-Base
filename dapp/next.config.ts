import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@rainbow-me/rainbowkit",
    "@wagmi/core",
    "@wagmi/connectors",
    "@walletconnect/ethereum-provider",
    "@walletconnect/universal-provider",
  ],
  
  // Mark server-side packages that should not be bundled
  serverExternalPackages: [
    "pino",
    "thread-stream",
    "pino-pretty",
  ],
  
  typescript: {
    // Ignore TypeScript errors during build (for production deployments)
    // Note: This is needed due to @noble/curves using .ts extensions in imports
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
