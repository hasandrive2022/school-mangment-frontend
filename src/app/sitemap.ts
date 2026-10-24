import type { MetadataRoute } from "next";
import { publicApi } from "@/lib/api";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const pages = await publicApi<{
    data?: Array<{ slug: string; updatedAt?: string }>;
  }>("/public/content/pages");
  const staticRoutes = [
    "",
    "/about",
    "/at-a-glance",
    "/message",
    "/teachers",
    "/committee",
    "/students",
    "/meritorious",
    "/notices",
    "/news",
    "/events",
    "/admission",
    "/result-search",
    "/results",
    "/public-attendance",
    "/routine",
    "/holidays",
    "/gallery",
    "/video-gallery",
    "/downloads",
    "/links",
    "/compliance",
    "/contact",
    "/club",
    "/receipt-verify",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  const dynamicRoutes = (pages?.data ?? []).map((page) => ({
    url: `${base}/${page.slug}`,
    lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...dynamicRoutes];
}
