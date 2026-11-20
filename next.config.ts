import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:5001";

const nextConfig: NextConfig = {
  // Same-origin proxy to the Express API (DEC-003): cookies stay first-party and there is no CORS preflight.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
  poweredByHeader: false,
  reactCompiler: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
