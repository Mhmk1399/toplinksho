import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce the minimal server bundle used by the production Docker image.
  output: "standalone",
  experimental: {
    // Next 16's detached CLI runner drops `tsc --showConfig` output in this environment.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
