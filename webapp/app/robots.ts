import type { MetadataRoute } from "next";

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
