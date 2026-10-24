import type { Metadata, Viewport } from "next";
import { cacheLife } from "next/cache";
import "./globals.css";
import { publicHome, type HomeData } from "@/lib/api";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Cached school lookup for metadata: with Cache Components enabled an
 * uncached fetch inside generateMetadata blocks prerendering (e.g. the
 * /_not-found route), so the school fetch is wrapped in "use cache".
 */
async function getSchoolForMetadata() {
  "use cache";
  cacheLife("hours");
  const payload = await publicHome<HomeData>().catch(() => null);
  return payload?.data?.school ?? null;
}

/**
 * Root metadata (Round 6, P4): the school name comes from the public API
 * (admin-controlled) with a safe generic fallback — never a hardcoded
 * demo-school name. `metadataBase` uses the shared site-URL resolver so
 * canonical / OG URLs never point at localhost in production. Child pages
 * set only their page title; the `%s | <school>` template appends the
 * school name.
 */
export async function generateMetadata(): Promise<Metadata> {
  const school = await getSchoolForMetadata();
  const name = school?.nameBn ?? "বিদ্যালয়";
  const nameEn = school?.nameEn ?? "";
  const description = `${name} — বিদ্যালয়ের তথ্য, নোটিশ, ফলাফল, ভর্তি ও শিক্ষার্থী পোর্টাল।`;
  const siteUrl = getSiteUrl();

  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    keywords: [name, nameEn, "বিদ্যালয়", "শিক্ষার্থী পোর্টাল", "ফলাফল", "নোটিশ", "ভর্তি"].filter(Boolean),
    openGraph: {
      type: "website",
      locale: "bn_BD",
      siteName: name,
      title: name,
      description,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
    alternates: { canonical: "/" },
    authors: [{ name }],
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f3151",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
