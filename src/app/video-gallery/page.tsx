import Link from "next/link";
import PublicShell from "@/components/site-chrome";
import { publicApi, type VideosResponse } from "@/lib/api";
import { bnDate } from "@/lib/bn";
import { ImagePlaceholder } from "@/components/image-placeholder";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ভিডিও গ্যালারি",
  description: "বিদ্যালয়ের অনুষ্ঠান ও কার্যক্রমের ভিডিও গ্যালারি।",
  alternates: { canonical: "/video-gallery" },
  openGraph: { title: "ভিডিও গ্যালারি", description: "বিদ্যালয়ের অনুষ্ঠান ও কার্যক্রমের ভিডিও গ্যালারি।", url: "/video-gallery" },
};

export default async function VideoGalleryPage() {
  const payload = await publicApi<VideosResponse>("/public/content/videos");
  const rows = payload?.data ?? [];

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>
            ভিডিও গ্যালারি
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>গ্যালারি</span>
            <span className="sep">›</span>
            <span className="cur">ভিডিও গ্যালারি</span>
          </nav>
        </div>
      </div>
      <main className="container page-body">
        {rows.length > 0 ? (
          <div className="video-grid">
            {rows.map((row) => (
              <a
                className="video-card"
                key={row.id}
                href={row.videoUrl}
                target="_blank"
                rel="noopener"
              >
                <span className="im">
                  {row.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.thumbnailUrl} alt={row.titleBn} loading="lazy" />
                  ) : (
                    <ImagePlaceholder label={row.titleBn} />
                  )}
                  <span className="play">
                    <i>
                      <svg className="icon" viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5-13-7.5Z" /></svg>
                    </i>
                  </span>
                </span>
                <span className="bd">
                  <h3>{row.titleBn}</h3>
                  {row.publishedAt && <p>{bnDate(row.publishedAt)}</p>}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="small muted center">কোনো ভিডিও এখনো প্রকাশিত হয়নি।</p>
        )}
      </main>
    </PublicShell>
  );
}
