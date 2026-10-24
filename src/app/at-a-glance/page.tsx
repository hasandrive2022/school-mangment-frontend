import type { Metadata } from "next";
import Link from "next/link";
import {
  publicApi,
  type HomeData,
  type PublicStudentsResponse,
} from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { toBn } from "@/lib/bn";
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
  title: "এক নজরে বিদ্যালয়",
  description: "বিদ্যালয়ের প্রতিষ্ঠা, EIIN, শিক্ষার্থী ও শিক্ষক সংখ্যাসহ এক নজরে সব তথ্য।",
};

export const instant = false;

export default async function AtAGlancePage() {
  const [pagesPayload, homePayload, studentsPayload] = await Promise.all([
    publicApi<PagesResponse>("/public/content/pages"),
    publicApi<HomeData>("/public/content/home"),
    publicApi<PublicStudentsResponse>("/public/students"),
  ]);
  const page = pagesPayload?.data.find((item) => item.slug === "at-a-glance");
  const home = homePayload?.data;
  const school = home?.school;
  const stats = home?.stats;
  const counts = studentsPayload?.counts ?? [];
  const totalFromCounts = counts.reduce((sum, c) => sum + c.count, 0);

  const facts: Array<{ label: string; value: string; green?: boolean }> = [];
  if (school?.eiin)
    facts.push({ label: "EIIN নম্বর", value: toBn(school.eiin) });
  if (school?.foundedYear)
    facts.push({
      label: "প্রতিষ্ঠার সাল",
      value: toBn(school.foundedYear),
      green: true,
    });
  if (typeof stats?.students === "number")
    facts.push({
      label: "মোট শিক্ষার্থী",
      value: `${stats.students.toLocaleString("bn-BD")} জন`,
    });
  if (typeof stats?.teachers === "number")
    facts.push({
      label: "মোট শিক্ষক",
      value: `${toBn(stats.teachers)} জন`,
      green: true,
    });
  if (school?.address)
    facts.push({ label: "ঠিকানা", value: school.address });

  const detailRows: Array<[string, string]> = [];
  if (school?.nameBn) detailRows.push(["প্রতিষ্ঠানের নাম", school.nameBn]);
  if (school?.nameEn) detailRows.push(["ইংরেজি নাম", school.nameEn]);
  if (school?.eiin) detailRows.push(["EIIN নম্বর", toBn(school.eiin)]);
  if (school?.foundedYear)
    detailRows.push([
      "প্রতিষ্ঠার সাল",
      `${toBn(school.foundedYear)} খ্রিস্টাব্দ`,
    ]);
  if (school?.address) detailRows.push(["ঠিকানা", school.address]);
  if (school?.phone) detailRows.push(["ফোন", toBn(school.phone)]);
  if (school?.email) detailRows.push(["ইমেইল", school.email]);
  if (typeof stats?.students === "number")
    detailRows.push([
      "মোট শিক্ষার্থী",
      `${stats.students.toLocaleString("bn-BD")} জন`,
    ]);
  if (typeof stats?.teachers === "number")
    detailRows.push(["মোট শিক্ষক", `${toBn(stats.teachers)} জন`]);

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {page?.titleBn ?? "এক নজরে বিদ্যালয়"}
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>আমাদের সম্পর্কে</span>
            <span className="sep">›</span>
            <span className="cur">এক নজরে</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {facts.length > 0 && (
          <div className="fact-grid">
            {facts.map((fact) => (
              <div className="fact" key={fact.label}>
                <div className={fact.green ? "fi green" : "fi"}>
                  <svg className="icon" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M3 9h18M8 4v5" />
                  </svg>
                </div>
                <div>
                  <b>{fact.value}</b>
                  <span>{fact.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="sec-head">
          <h2 className="sec-title">বিস্তারিত তথ্য</h2>
        </div>
        <div className="two-col">
          <article className="card prose" style={{ padding: 26 }}>
            {page?.excerpt && <p className="lead">{page.excerpt}</p>}
            {page?.body ? (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }}
              />
            ) : (
              <p>বিস্তারিত তথ্য এখনো প্রকাশিত হয়নি।</p>
            )}
          </article>
          {detailRows.length > 0 ? (
            <aside>
              <div className="tbl-wrap" style={{ boxShadow: "var(--shadow)" }}>
                <table className="info-table">
                  <tbody>
                    {detailRows.map(([label, value]) => (
                      <tr key={label}>
                        <th>{label}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </aside>
          ) : (
            <aside>
              <div className="card side-box">
                <h3>
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />
                  </svg>
                  দ্রুত লিঙ্ক
                </h3>
                <ul className="side-list">
                  <li>
                    <Link href="/about">বিদ্যালয় পরিচিতি</Link>
                  </li>
                  <li>
                    <Link href="/teachers">শিক্ষকবৃন্দ</Link>
                  </li>
                  <li>
                    <Link href="/notices">নোটিশ বোর্ড</Link>
                  </li>
                  <li>
                    <Link href="/admission">ভর্তি তথ্য</Link>
                  </li>
                </ul>
              </div>
            </aside>
          )}
        </div>

        {counts.length > 0 && (
          <>
            <div className="sec-head">
              <h2 className="sec-title">শ্রেণিভিত্তিক শিক্ষার্থী সংখ্যা</h2>
            </div>
            <div className="tbl-wrap">
              <table className="data ct">
                <thead>
                  <tr>
                    <th>শ্রেণি</th>
                    <th>মোট শিক্ষার্থী</th>
                  </tr>
                </thead>
                <tbody>
                  {counts.map((c) => (
                    <tr key={c.classId ?? c.classBn ?? "class"}>
                      <td data-label="শ্রেণি">{c.classBn ?? "শ্রেণি"}</td>
                      <td data-label="মোট শিক্ষার্থী" className="num">
                        <b>{toBn(c.count)} জন</b>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td data-label="শ্রেণি">
                      <b>সর্বমোট</b>
                    </td>
                    <td data-label="মোট শিক্ষার্থী" className="num">
                      <b>{toBn(totalFromCounts)} জন</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="small muted" style={{ marginTop: 10 }}>
              ছাত্র/ছাত্রীভিত্তিক বিভাজন প্রকাশিত তথ্যে নেই — শুধু শ্রেণিভিত্তিক
              মোট সংখ্যা দেখানো হয়েছে।
            </p>
          </>
        )}
      </div>
    </PublicShell>
  );
}
