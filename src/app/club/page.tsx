import type { Metadata } from "next";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
import PublicShell from "@/components/site-chrome";

type PagesResponse = {
  data: Array<{
    id: string;
    slug: string;
    titleBn: string;
    body: string;
    excerpt: string | null;
  }>;
};

export const metadata: Metadata = {
  title: "স্কাউট দল",
  description: "বিদ্যালয়ের স্কাউট দল ও সহপাঠক্রমিক কার্যক্রম।",
};

const OTHER_CLUBS: Array<{ label: string; href: string }> = [
  { label: "ক্রীড়া দল", href: "/sports" },
  { label: "বিজ্ঞান ক্লাব", href: "/science-club" },
  { label: "বিদ্যালয় পরিচিতি", href: "/about" },
  { label: "শিক্ষকবৃন্দ", href: "/teachers" },
  { label: "ফটো গ্যালারি", href: "/gallery" },
];

export default async function ClubPage() {
  const pagesPayload = await publicApi<PagesResponse>(
    "/public/content/pages",
  );
  const pages = pagesPayload?.data ?? [];
  const page =
    pages.find((item) => item.slug === "scout-club") ??
    pages.find(
      (item) => item.slug.includes("scout") || item.slug.includes("club"),
    );

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M12 2 9.2 8.1 2.5 9l4.9 4.6L6.2 20 12 16.7 17.8 20l-1.2-6.4L21.5 9l-6.7-.9L12 2Z" />
            </svg>
            সহপাঠক্রমিক কার্যক্রম — স্কাউট
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>আমাদের সম্পর্কে</span>
            <span className="sep">›</span>
            <span className="cur">স্কাউট দল</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        <div className="club-hero a-noimg">
          <div className="cap">
            <h3>{page?.titleBn ?? "স্কাউট দল"}</h3>
            {page?.excerpt && <p>{page.excerpt}</p>}
          </div>
        </div>
        <div className="two-col">
          <article className="card prose" style={{ padding: 26 }}>
            {page?.body ? (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }}
              />
            ) : (
              <p>
                স্কাউট দল সম্পর্কে বিস্তারিত তথ্য এখনো প্রকাশিত হয়নি।
              </p>
            )}
          </article>
          <aside>
            <div className="card side-box">
              <h3>
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M12 2 9.2 8.1 2.5 9l4.9 4.6L6.2 20 12 16.7 17.8 20l-1.2-6.4L21.5 9l-6.7-.9L12 2Z" />
                </svg>
                অন্যান্য ক্লাব ও দল
              </h3>
              <ul className="side-list">
                {OTHER_CLUBS.map((club) => (
                  <li key={club.href}>
                    <Link href={club.href}>{club.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card side-box" style={{ marginTop: 18 }}>
              <h3>
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />
                </svg>
                দ্রুত লিঙ্ক
              </h3>
              <ul className="side-list">
                <li>
                  <Link href="/notices">নোটিশ বোর্ড</Link>
                </li>
                <li>
                  <Link href="/admission">ভর্তি তথ্য</Link>
                </li>
                <li>
                  <Link href="/result-search">ফলাফল অনুসন্ধান</Link>
                </li>
                <li>
                  <Link href="/holidays">ছুটির তালিকা</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
        <p className="small muted" style={{ marginTop: 14 }}>
          দলের তথ্য (স্কাউট শিক্ষক, সদস্য সংখ্যা, ট্রূপ সভার সময়) ও কার্যক্রমের
          ছবি প্রকাশিত তথ্যে থাকলে এখানে দেখানো হবে — বর্তমানে সেগুলো নেই।
        </p>
      </div>
    </PublicShell>
  );
}
