import type { MetadataRoute } from "next";

const BASE = "https://aggiewranglers.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "", "/public-lessons", "/private-lessons", "/private-lesson-request",
    "/performances-information", "/performance-request",
    "/requirements", "/meet-the-team", "/current-team", "/history",
    "/alumni", "/faq", "/banquet", "/sponsorships", "/watch", "/merchandise",
    "/contact", "/privacy",
  ];
  const now = new Date();
  return routes.map(path => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/public-lessons" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
