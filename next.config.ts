import type { NextConfig } from "next";

// Static export: the whole app runs in the browser, no server needed.
// GitHub Pages serves a project site under /<repo>/, so the deploy workflow sets PAGES_BASE_PATH=/Zeno.
// Locally it's unset and the app runs at /.
const basePath = process.env.PAGES_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
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
