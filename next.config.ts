import type { NextConfig } from "next";

/**
 * GitHub Pages build: the deploy workflow sets PAGES_BASE_PATH (e.g. "/Summit"), which switches on a
 * static export (plain HTML in /out) served from the repo sub-path. Without it (local dev, `next start`,
 * Vercel) the site builds normally with optimised images.
 */
const pagesBase = process.env.PAGES_BASE_PATH;
const isPages = pagesBase !== undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  ...(isPages
    ? {
        output: "export",
        basePath: pagesBase,
        trailingSlash: true,
        images: { unoptimized: true }, // no image server on GitHub Pages
      }
    : {
        images: { formats: ["image/avif", "image/webp"] },
      }),
  env: { NEXT_PUBLIC_BASE_PATH: isPages ? pagesBase : "" },
};

export default nextConfig;
