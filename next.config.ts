import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
