/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
// When building for GitHub Pages, the site lives at /aw-website on the org domain.
// In dev (npm run dev), basePath is empty so everything works at localhost:3000/.
const basePath = isProd ? "/aw-website" : "";

const nextConfig = {
  output: "export",
  basePath,
  // Required for static export — disables Next/Image optimization.
  images: { unoptimized: true, remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // GH Pages adds trailing slashes by default; opt in to match URLs cleanly.
  trailingSlash: true,
  // Make basePath available to client code (for things like prefixing /portal links from server components).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

module.exports = nextConfig;
