/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import {
  publicApi,
  type CommitteeResponse,
} from "@/lib/api";
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
  title: "পরিচালনা পরিষদ",
  description: "বিদ্যালয় পরিচালনা পরিষদের সদস্যবৃন্দ ও সভাপতির কথা।",
};

export default async function CommitteePage() {
  const [pagesPayload, committeePayload] = await Promise.all([
    publicApi<PagesResponse>("/public/content/pages"),
    publicApi<CommitteeResponse>("/public/content/committee"),
  ]);
  const page = pagesPayload?.data.find((item) => item.slug === "committee");
  const members = [...(committeePayload?.data ?? [])].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
  const chairman = members.find((m) => m.roleBn.includes("সভাপতি"));

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
            </svg>
            {page?.titleBn ?? "পরিচালনা পরিষদ"}
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>আমাদের সম্পর্কে</span>
            <span className="sep">›</span>
            <span className="cur">পরিচালনা পরিষদ</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {chairman && page?.body ? (
          <div className="msg-layout" style={{ marginBottom: 22 }}>
            <div className="card msg-photo">
              {chairman.photoUrl ? (
                <img
                  src={chairman.photoUrl}
                  alt={`${chairman.nameBn}র ছবি`}
                  loading="lazy"
                />
              ) : (
                <div className="msg-photo-txt" aria-hidden="true">
                  <span>{chairman.nameBn?.charAt(0) ?? "স"}</span>
                </div>
              )}
              <h3>{chairman.nameBn}</h3>
              <div className="desig">{chairman.roleBn}</div>
            </div>
            <article className="card prose" style={{ padding: 26 }}>
              <h3 style={{ marginTop: 0 }}>সভাপতির কথা</h3>
              {page.excerpt && <p className="lead">{page.excerpt}</p>}
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }}
              />
              <div className="alert alert-blue" style={{ margin: "18px 0 0" }}>
                <svg className="icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8h.01M12 11v5" />
                </svg>
                <span>
                  পরিষদ সংক্রান্ত যেকোনো তথ্যের জন্য অফিসে যোগাযোগ করুন অথবা{" "}
                  <Link href="/compliance">
                    <b>অনলাইনে অভিযোগ</b>
                  </Link>{" "}
                  দাখিল করুন।
                </span>
              </div>
            </article>
          </div>
        ) : (
          <div className="two-col" style={{ marginBottom: 22 }}>
            <article className="card prose" style={{ padding: 26 }}>
              {page?.excerpt && <p className="lead">{page.excerpt}</p>}
              {page?.body ? (
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }}
                />
              ) : (
                <p>পরিচালনা পরিষদ সম্পর্কে তথ্য এখনো প্রকাশিত হয়নি।</p>
              )}
              <div className="alert alert-blue" style={{ margin: "18px 0 0" }}>
                <svg className="icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8h.01M12 11v5" />
                </svg>
                <span>
                  পরিষদ সংক্রান্ত যেকোনো তথ্যের জন্য অফিসে যোগাযোগ করুন অথবা{" "}
                  <Link href="/compliance">
                    <b>অনলাইনে অভিযোগ</b>
                  </Link>{" "}
                  দাখিল করুন।
                </span>
              </div>
            </article>
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
                  <li>
                    <Link href="/result-search">ফলাফল অনুসন্ধান</Link>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}

        <div className="sec-head">
          <h2 className="sec-title">পরিষদের সদস্যবৃন্দ</h2>
        </div>
        {members.length > 0 ? (
          <div className="person-grid c3">
            {members.map((member, index) => (
              <div className="pcard" key={member.id}>
                {member.photoUrl ? (
                  <div className="ph">
                    <img
                      src={member.photoUrl}
                      alt={`${member.nameBn}র ছবি`}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className={`ph ph-txt${index % 2 === 1 ? " green" : ""}`}
                  >
                    <span>{member.nameBn?.charAt(0) ?? "স"}</span>
                  </div>
                )}
                <h3>{member.nameBn}</h3>
                <div className="desig">{member.roleBn}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="a-empty">
            পরিষদের সদস্যদের তালিকা এখনো প্রকাশিত হয়নি।
          </div>
        )}
        <p className="small muted" style={{ marginTop: 12 }}>
          সদস্যদের প্রতিনিধিত্ব ও মোবাইল নম্বর প্রকাশিত তথ্যে নেই — তাই সেগুলো
          দেখানো হয়নি।
        </p>
      </div>
    </PublicShell>
  );
}
