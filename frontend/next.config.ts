import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    webpackBuildWorker: false,
    cpus: 1,
    workerThreads: false,
  },
  turbopack: {
    root: currentDirectory,
  },
};

export default nextConfig;
