import type { Metadata, Viewport } from "next";
import "./globals.css";

export const instant = false;

export const metadata: Metadata = {
  title: "আদর্শ মডেল উচ্চ বিদ্যালয়",
  description: "আদর্শ মডেল উচ্চ বিদ্যালয়ের জনসাধারণের ও শিক্ষার্থী পোর্টাল",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  keywords: [
    "আদর্শ মডেল উচ্চ বিদ্যালয়",
    "কুড়িগ্রাম স্কুল",
    "শিক্ষার্থী পোর্টাল",
    "ফলাফল",
  ],
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: "আদর্শ মডেল উচ্চ বিদ্যালয়",
    title: "আদর্শ মডেল উচ্চ বিদ্যালয়",
    description: "বিদ্যালয়ের তথ্য, নোটিশ, ফলাফল ও শিক্ষার্থী পোর্টাল",
  },
  twitter: {
    card: "summary",
    title: "আদর্শ মডেল উচ্চ বিদ্যালয়",
    description: "বিদ্যালয়ের জনসাধারণের ও শিক্ষার্থী পোর্টাল",
  },
  alternates: { canonical: "/" },
  authors: [{ name: "আদর্শ মডেল উচ্চ বিদ্যালয়" }],
  robots: { index: true, follow: true },
};

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
