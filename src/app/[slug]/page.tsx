/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { publicApi, type CommitteeResponse, type HomeData } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { toBn } from "@/lib/bn";
import PublicShell from "@/components/site-chrome";

type PageResponse = {
  data: Array<{
    id: string;
    slug: string;
    titleBn: string;
    titleEn: string | null;
    body: string;
    excerpt: string | null;
  }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const payload = await publicApi<PageResponse>("/public/content/pages");
  const page = payload?.data.find((item) => item.slug === slug);
  if (!page) return { title: "পৃষ্ঠা পাওয়া যায়নি" };
  const description =
    page.excerpt ?? page.body.replace(/<[^>]+>/g, " ").slice(0, 155);
  return {
    title: page.titleBn,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.titleBn, description, type: "article" },
  };
}

function SideLinks() {
  return (
    <aside>
      <div className="card side-box">
        <h3>
          <svg className="icon" viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" /></svg>
          দ্রুত লিঙ্ক
        </h3>
        <ul className="side-list">
          <li><Link href="/about">বিদ্যালয় পরিচিতি</Link></li>
          <li><Link href="/teachers">শিক্ষকবৃন্দ</Link></li>
          <li><Link href="/notices">নোটিশ বোর্ড</Link></li>
          <li><Link href="/admission">ভর্তি তথ্য</Link></li>
          <li><Link href="/result-search">ফলাফল অনুসন্ধান</Link></li>
        </ul>
      </div>
    </aside>
  );
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const payload = await publicApi<PageResponse>("/public/content/pages");
  const page = payload?.data.find((item) => item.slug === slug);
  if (!page) notFound();

  const isGlance = slug.includes("glance");
  const isCommittee = slug.includes("committee");
  const isClub = slug.includes("club");

  const committeePayload = isCommittee
    ? await publicApi<CommitteeResponse>("/public/content/committee")
    : null;
  const committeeMembers = [...(committeePayload?.data ?? [])].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  const homePayload = isGlance ? await publicApi<HomeData>("/public/content/home") : null;
  const home = homePayload?.data;
  const school = home?.school;
  const stats = home?.stats;

  const facts: Array<{ label: string; value: string; green?: boolean }> = [];
  if (school?.eiin) facts.push({ label: "EIIN নম্বর", value: toBn(school.eiin) });
  if (school?.foundedYear) facts.push({ label: "প্রতিষ্ঠার সাল", value: toBn(school.foundedYear), green: true });
  if (typeof stats?.students === "number") facts.push({ label: "মোট শিক্ষার্থী", value: `${stats.students.toLocaleString("bn-BD")} জন` });
  if (typeof stats?.teachers === "number") facts.push({ label: "মোট শিক্ষক", value: `${toBn(stats.teachers)} জন`, green: true });
  if (school?.address) facts.push({ label: "ঠিকানা", value: school.address });
  if (school?.nameBn) facts.push({ label: "প্রতিষ্ঠানের নাম", value: school.nameBn, green: true });

  const detailRows: Array<[string, string]> = [];
  if (school?.nameBn) detailRows.push(["প্রতিষ্ঠানের নাম", school.nameBn]);
  if (school?.nameEn) detailRows.push(["ইংরেজি নাম", school.nameEn]);
  if (school?.eiin) detailRows.push(["EIIN নম্বর", toBn(school.eiin)]);
  if (school?.foundedYear) detailRows.push(["প্রতিষ্ঠার সাল", `${toBn(school.foundedYear)} খ্রিস্টাব্দ`]);
  if (school?.address) detailRows.push(["ঠিকানা", school.address]);
  if (typeof stats?.students === "number") detailRows.push(["মোট শিক্ষার্থী", `${stats.students.toLocaleString("bn-BD")} জন`]);
  if (typeof stats?.teachers === "number") detailRows.push(["মোট শিক্ষক", `${toBn(stats.teachers)} জন`]);

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 12h.01M15 12h.01" /></svg>
            {page.titleBn}
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>আমাদের সম্পর্কে</span>
            <span className="sep">›</span>
            <span className="cur">{page.titleBn}</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {isGlance ? (
          <>
            {facts.length > 0 && (
              <div className="fact-grid">
                {facts.map((fact) => (
                  <div className="fact" key={fact.label}>
                    <div className={fact.green ? "fi green" : "fi"}>
                      <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v5" /></svg>
                    </div>
                    <div>
                      <b>{fact.value}</b>
                      <span>{fact.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="sec-head"><h2 className="sec-title">বিস্তারিত তথ্য</h2></div>
            <div className="two-col">
              <article className="card prose" style={{ padding: 26 }}>
                {page.excerpt && <p className="lead">{page.excerpt}</p>}
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
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
                <SideLinks />
              )}
            </div>
          </>
        ) : isClub ? (
          <>
            <div className="club-hero a-noimg">
              <div className="cap">
                <h3>{page.titleBn}</h3>
                {page.excerpt && <p>{page.excerpt}</p>}
              </div>
            </div>
            <div className="two-col">
              <article className="card prose" style={{ padding: 26 }}>
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
              </article>
              <SideLinks />
            </div>
          </>
        ) : isCommittee ? (
          <>
            <div className="two-col">
              <article className="card prose" style={{ padding: 26 }}>
                {page.excerpt && <p className="lead">{page.excerpt}</p>}
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
                <div className="alert alert-blue" style={{ margin: "18px 0 0" }}>
                  <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
                  <span>পরিষদ সংক্রান্ত যেকোনো তথ্যের জন্য অফিসে যোগাযোগ করুন অথবা <Link href="/compliance"><b>অনলাইনে অভিযোগ</b></Link> দাখিল করুন।</span>
                </div>
              </article>
              <SideLinks />
            </div>
            {committeeMembers.length > 0 && (
              <>
                <div className="sec-head" style={{ marginTop: 26 }}>
                  <h2 className="sec-title">পরিষদের সদস্যবৃন্দ</h2>
                </div>
                <div className="person-grid c3">
                  {committeeMembers.map((member, index) => (
                    <div className="pcard" key={member.id}>
                      {member.photoUrl ? (
                        <div className="ph">
                          <img src={member.photoUrl} alt={`${member.nameBn}র ছবি`} loading="lazy" />
                        </div>
                      ) : (
                        <div className={`ph ph-txt${index % 2 === 1 ? " green" : ""}`}>
                          <span>{member.nameBn?.charAt(0) ?? "স"}</span>
                        </div>
                      )}
                      <h3>{member.nameBn}</h3>
                      <div className="desig">{member.roleBn}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="two-col">
            <article className="card prose" style={{ padding: 26 }}>
              {page.excerpt && <p className="lead">{page.excerpt}</p>}
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
            </article>
            <SideLinks />
          </div>
        )}
      </div>
    </PublicShell>
  );
}
