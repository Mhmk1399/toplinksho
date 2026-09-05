import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next 16's detached CLI runner drops `tsc --showConfig` output in this environment.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
