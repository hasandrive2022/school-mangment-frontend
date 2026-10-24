import Link from "next/link";
import { publicApi, type HomeData } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { toBn } from "@/lib/bn";
import PublicShell from "@/components/site-chrome";

type PagesResponse = {
  data: Array<{ id: string; slug: string; titleBn: string; body: string }>;
};

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "বিদ্যালয় পরিচিতি",
  description: "বিদ্যালয়ের ইতিহাস, প্রতিষ্ঠার সাল, EIIN, ঠিকানা ও সাধারণ তথ্য।",
  alternates: { canonical: "/about" },
  openGraph: { title: "বিদ্যালয় পরিচিতি", description: "বিদ্যালয়ের ইতিহাস, প্রতিষ্ঠার সাল, EIIN, ঠিকানা ও সাধারণ তথ্য।", url: "/about" },
};

export default async function AboutPage() {
  const [pagesPayload, homePayload] = await Promise.all([
    publicApi<PagesResponse>("/public/content/pages"),
    publicApi<HomeData>("/public/content/home"),
  ]);
  const page = pagesPayload?.data.find((item) => item.slug === "about");
  const home = homePayload?.data;
  const school = home?.school;
  const stats = home?.stats;

  const infoRows: Array<[string, string]> = [];
  if (school?.foundedYear) infoRows.push(["প্রতিষ্ঠার সাল", `${toBn(school.foundedYear)} খ্রিস্টাব্দ`]);
  if (school?.eiin) infoRows.push(["EIIN নম্বর", toBn(school.eiin)]);
  if (school?.address) infoRows.push(["ঠিকানা", school.address]);
  if (typeof stats?.students === "number") infoRows.push(["মোট শিক্ষার্থী", `${stats.students.toLocaleString("bn-BD")} জন`]);
  if (typeof stats?.teachers === "number") infoRows.push(["মোট শিক্ষক", `${toBn(stats.teachers)} জন`]);

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 12h.01M15 12h.01" /></svg>
            {page?.titleBn ?? "বিদ্যালয় পরিচিতি"}
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>আমাদের সম্পর্কে</span>
            <span className="sep">›</span>
            <span className="cur">{page?.titleBn ?? "বিদ্যালয় পরিচিতি"}</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        <div className="two-col">
          <article className="card prose" style={{ padding: 26 }}>
            {page?.body ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
            ) : (
              <p>কোনো প্রকাশিত তথ্য নেই।</p>
            )}
            {infoRows.length > 0 && (
              <>
                <h3>এক নজরে তথ্য</h3>
                <table className="info-table">
                  <tbody>
                    {infoRows.map(([label, value]) => (
                      <tr key={label}>
                        <th>{label}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </article>
          <aside>
            <div className="card side-box">
              <h3>
                <svg className="icon" viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" /></svg>
                দ্রুত লিঙ্ক
              </h3>
              <ul className="side-list">
                <li><Link href="/about">এক নজরে বিদ্যালয়</Link></li>
                <li><Link href="/teachers">শিক্ষকবৃন্দ</Link></li>
                <li><Link href="/admission">ভর্তি তথ্য</Link></li>
                <li><Link href="/result-search">ফলাফল অনুসন্ধান</Link></li>
                <li><Link href="/holidays">ছুটির তালিকা</Link></li>
              </ul>
            </div>
            {(school?.address || school?.eiin) && (
              <div className="card side-box" style={{ marginTop: 18 }}>
                <h3>
                  <svg className="icon" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z" /></svg>
                  যোগাযোগ
                </h3>
                <ul className="side-list">
                  {school?.address && <li><Link href="/contact">{school.address}</Link></li>}
                  {school?.eiin && <li><Link href="/contact">EIIN: {toBn(school.eiin)}</Link></li>}
                </ul>
                <p className="small muted" style={{ margin: "12px 0 0" }}>অফিস সময়: রবিবার–বৃহস্পতিবার, সকাল ৯টা – বিকেল ৪টা</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
