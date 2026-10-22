import type { MetadataRoute } from "next";
import { publicApi } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pages = await publicApi<{
    data?: Array<{ slug: string; updatedAt?: string }>;
  }>("/public/content/pages");
  const staticRoutes = [
    "",
    "/about",
    "/admission",
    "/contact",
    "/notices",
    "/news",
    "/events",
    "/gallery",
    "/downloads",
    "/links",
    "/results",
    "/receipt-verify",
    "/public-attendance",
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
