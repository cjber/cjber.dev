import type { NextConfig } from "next";

// Every page is static, so export plain HTML for Cloudflare Pages. Cache and
// security headers live in public/_headers, which Pages applies at the edge.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
