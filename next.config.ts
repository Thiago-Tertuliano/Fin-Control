import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/*": [
      "./lib/db/migrations/**/*",
      "./node_modules/better-sqlite3/build/Release/**/*",
      "./node_modules/better-sqlite3/lib/**/*",
      "./node_modules/better-sqlite3/package.json",
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@icons-pack/react-simple-icons",
      "date-fns",
    ],
  },
};

export default nextConfig;
