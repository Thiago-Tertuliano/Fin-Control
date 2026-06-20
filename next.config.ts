import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
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
