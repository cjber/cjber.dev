import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Long edge cache + SWR for HTML; immutable for hashed Next assets.
  // Cloudflare Pages also reads /public/_headers, but Next's headers() applies
  // during local `next dev` and `next start` so behaviour matches.
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=604800",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
