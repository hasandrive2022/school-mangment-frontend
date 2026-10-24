import Link from "next/link";
import { Suspense } from "react";
import { publicApi } from "@/lib/api";
import PublicShell from "@/components/site-chrome";
import NoticesBrowser, { type NoticeRow } from "./notices-browser";

type Response = { data: NoticeRow[] };

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "নোটিশ বোর্ড",
  description: "বিদ্যালয়ের সব নোটিশ ও বিজ্ঞপ্তি — ভর্তি, পরীক্ষা, ফলাফল ও সাধারণ।",
  alternates: { canonical: "/notices" },
  openGraph: { title: "নোটিশ বোর্ড", description: "বিদ্যালয়ের সব নোটিশ ও বিজ্ঞপ্তি — ভর্তি, পরীক্ষা, ফলাফল ও সাধারণ।", url: "/notices" },
};

export default async function NoticesPage() {
  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M4 22h16M6 2v20M18 2v20M6 8h12M6 13h12M6 18h8" /></svg>
            নোটিশ বোর্ড
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span className="cur">নোটিশ বোর্ড</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        <Suspense fallback={<NoticesFallback />}>
          <NoticesContent />
        </Suspense>
      </div>
    </PublicShell>
  );
}

async function NoticesContent() {
  const payload = await publicApi<Response>("/public/content/notices");
  const rows = [...(payload?.data ?? [])].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return rows.length > 0 ? (
    <NoticesBrowser rows={rows} />
  ) : (
    <div className="a-empty">কোনো প্রকাশিত তথ্য নেই।</div>
  );
}

function NoticesFallback() {
  return (
    <div className="notice-list" aria-busy="true" aria-label="নোটিশ লোড হচ্ছে">
      {["১", "২", "৩"].map((key) => (
        <div className="nitem notice-loading" key={key}>
          <div className="skeleton skeleton-line skeleton-line-wide" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line-short" />
        </div>
      ))}
    </div>
  );
}
