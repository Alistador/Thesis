import path from "path";
import { fileURLToPath } from "url";

/** Fix `__dirname` for ES Modules */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "bcrypt"],

  webpack: (config) => {
    config.externals.push("bcrypt"); // ✅ Prevent Webpack from bundling bcrypt

    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: { chunks: "all" },
    };

    config.cache = {
      type: "filesystem",
      cacheDirectory: path.resolve(__dirname, ".next/cache/webpack"),
      compression: "gzip",
      managedPaths: [path.resolve(__dirname, "node_modules")],
    };

    return config;
  },
};

export default nextConfig;
