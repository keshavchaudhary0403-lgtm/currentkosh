import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stories are JSON files read at request time; ship them with every server function.
  outputFileTracingIncludes: { "/**": ["./content/**/*.json"] },
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
