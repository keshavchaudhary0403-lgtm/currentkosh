import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stories are JSON files read at request time; ship them with every server function.
  outputFileTracingIncludes: { "/**": ["./content/**/*.json"] },
  // The service worker must never be cached by the browser, or updates would never reach installed apps.
  async redirects() {
    return [{ source: "/archive", destination: "/library", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
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
