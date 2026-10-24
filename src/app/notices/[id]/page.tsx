import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { categoryLabel } from "@/lib/categories";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { bnDate } from "@/lib/bn";
import PublicShell from "@/components/site-chrome";

type Notice = {
  id: string;
  titleBn: string;
  details: string;
  category: string;
  isPinned?: boolean;
  createdAt?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await publicApi<{ data: Notice[] }>("/public/content/notices");
  const notice = result?.data.find((item) => item.id === id);
  if (!notice) return { title: "নোটিশ পাওয়া যায়নি" };
  const description = notice.details
    ? notice.details.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 155)
    : `${notice.titleBn} — বিদ্যালয়ের নোটিশ।`;
  return {
    title: notice.titleBn,
    description,
    alternates: { canonical: `/notices/${id}` },
    openGraph: { title: notice.titleBn, description, type: "article", url: `/notices/${id}` },
  };
}

export default async function NoticeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await publicApi<{ data: Notice[] }>("/public/content/notices");
  const notice = result?.data.find((item) => item.id === id);
  if (!notice) notFound();
  const recent = (result?.data ?? []).filter((item) => item.id !== id).slice(0, 4);

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>
            নোটিশের বিস্তারিত
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <Link href="/notices">নোটিশ বোর্ড</Link>
            <span className="sep">›</span>
            <span className="cur">{notice.titleBn}</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        <div className="two-col">
          <article className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              {notice.category && <span className="chip">{categoryLabel(notice.category)}</span>}
              {notice.isPinned && <span className="chip chip-red">পিন করা</span>}
              {notice.createdAt && (
                <span className="news-date" style={{ marginLeft: "auto" }}>
                  <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /></svg>
                  প্রকাশ: {bnDate(notice.createdAt)}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: 23, color: "var(--p800)", marginBottom: 14 }}>{notice.titleBn}</h2>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(notice.details) }}
            />
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
              <Link href="/notices" className="btn btn-outline btn-sm" style={{ marginLeft: "auto" }}>‹ সব নোটিশ</Link>
            </div>
          </article>
          <aside>
            {recent.length > 0 && (
              <div className="card side-box">
                <h3>
                  <svg className="icon" viewBox="0 0 24 24"><path d="M4 22h16M6 2v20M18 2v20M6 8h12M6 13h12" /></svg>
                  সাম্প্রতিক নোটিশ
                </h3>
                <ul className="side-list">
                  {recent.map((item) => (
                    <li key={item.id}><Link href={`/notices/${item.id}`}>{item.titleBn}</Link></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="card side-box" style={{ marginTop: recent.length > 0 ? 18 : 0 }}>
              <h3>
                <svg className="icon" viewBox="0 0 24 24"><path d="M22 9 12 4 2 9l10 5 10-5ZM6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" /></svg>
                ভর্তি চলছে
              </h3>
              <p className="small muted" style={{ margin: "0 0 12px" }}>অনলাইন ভর্তি আবেদন ও ভর্তি সংক্রান্ত তথ্য ভর্তি পেজে পাওয়া যাবে।</p>
              <Link href="/admission" className="btn btn-green" style={{ width: "100%" }}>অনলাইনে আবেদন করুন</Link>
            </div>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
