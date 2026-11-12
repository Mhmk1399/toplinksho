import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/pricing/reservation", destination: "/pricing#consultation", permanent: true },
      { source: "/services/web-design", destination: "/services/design/web-design", permanent: true },
      { source: "/services/branding", destination: "/services/design/brand-identity", permanent: true },
      { source: "/services/seo", destination: "/services/growth/seo", permanent: true },
      { source: "/services/social-media", destination: "/services/growth/social-media-marketing", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "X-Frame-Options", value: "DENY" }] },
      { source: "/sw.js", headers: [{ key: "Content-Type", value: "application/javascript; charset=utf-8" }, { key: "Cache-Control", value: "no-store, max-age=0" }, { key: "Service-Worker-Allowed", value: "/" }, { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'; connect-src 'self'" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  experimental: {
    // Next 16's detached CLI runner drops `tsc --showConfig` output in this environment.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
