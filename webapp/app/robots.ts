import type { MetadataRoute } from "next";

// Metadata routes are dynamic by default in Next.js 15. Static export requires
// them to be generated at build time, which matches the Next 14 behavior.
export const dynamic = "force-static";

// Preview deployment: disallow all crawling.
// When going to production, flip to the indexing rules in the commented block.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };

  // Production rules (commented for now):
  // return {
  //   rules: [{ userAgent: "*", allow: "/", disallow: ["/portal/", "/api/"] }],
  //   sitemap: "https://aggiewranglers.com/sitemap.xml",
  // };
}
