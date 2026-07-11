/** @type {import('next').NextConfig} */
// Only the GitHub Pages deployment lives under /aw-website (the workflow sets
// GITHUB_PAGES=true). Vercel and local dev serve from the domain root, so the
// basePath must stay empty there or every asset URL breaks.
const basePath = process.env.GITHUB_PAGES === "true" ? "/aw-website" : "";

const nextConfig = {
  output: "export",
  basePath,
  // Required for static export — disables Next/Image optimization.
  images: { unoptimized: true, remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // GH Pages adds trailing slashes by default; opt in to match URLs cleanly.
  trailingSlash: true,
  // Fail the build on type errors and lint errors — these were previously
  // ignored "for the first deploy" and promptly hid two real type errors.
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  // Make basePath available to client code (for things like prefixing /portal links from server components).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

module.exports = nextConfig;

