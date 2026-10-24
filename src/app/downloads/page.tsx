import Link from "next/link";
import { publicApi } from "@/lib/api";
import PublicShell from "@/components/site-chrome";
import DownloadsBrowser, { type DownloadRow } from "./downloads-browser";

type Response = { data: DownloadRow[] };

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ডাউনলোড",
  description: "ভর্তি ফরম, সিলেবাসসহ প্রয়োজনীয় ফাইল ও নথি ডাউনলোড করুন।",
  alternates: { canonical: "/downloads" },
  openGraph: { title: "ডাউনলোড", description: "ভর্তি ফরম, সিলেবাসসহ প্রয়োজনীয় ফাইল ও নথি ডাউনলোড করুন।", url: "/downloads" },
};

export default async function DownloadsPage() {
  const payload = await publicApi<Response>("/public/content/downloads");
  const rows = payload?.data ?? [];

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3" /></svg>
            ডাউনলোড
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span className="cur">ডাউনলোড</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {rows.length > 0 ? <DownloadsBrowser rows={rows} /> : <div className="a-empty">কোনো প্রকাশিত তথ্য নেই।</div>}
      </div>
    </PublicShell>
  );
}
