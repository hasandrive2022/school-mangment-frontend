/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { publicApi, type HomeData } from "@/lib/api";
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

type Message = HomeData["data"]["messages"][number];

export const metadata: Metadata = {
  title: "বাণী",
  description: "প্রধান শিক্ষক ও সভাপতির বাণী।",
};

function MessageBody({ body }: { body: string }) {
  if (/<[a-z][\s\S]*>/i.test(body)) {
    return (
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(body) }} />
    );
  }
  const paragraphs = body
    .split(/\n{2,}|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return null;
  return (
    <>
      {paragraphs.map((paragraph, index) =>
        index === 0 ? (
          <p className="lead" key={index}>
            {paragraph}
          </p>
        ) : (
          <p key={index}>{paragraph}</p>
        ),
      )}
    </>
  );
}

function MessageBlock({
  message,
  schoolName,
}: {
  message: Message;
  schoolName?: string;
}) {
  return (
    <div className="msg-layout" style={{ marginBottom: 26 }}>
      <div className="card msg-photo">
        {message.photoUrl ? (
          <img
            src={message.photoUrl}
            alt={`${message.personNameBn}র ছবি`}
            loading="lazy"
          />
        ) : (
          <div className="msg-photo-txt" aria-hidden="true">
            <span>{message.personNameBn?.charAt(0) ?? "বা"}</span>
          </div>
        )}
        <h3>{message.personNameBn}</h3>
        <div className="desig">{message.designationBn}</div>
      </div>
      <article className="card prose" style={{ padding: 28 }}>
        <div className="quote-mark">“</div>
        <MessageBody body={message.body} />
        <p style={{ marginTop: 20 }}>
          শুভেচ্ছান্তে,
          <br />
          <b>{message.personNameBn}</b>
          <br />
          <span className="muted">
            {message.designationBn}
            {schoolName ? `, ${schoolName}` : ""}
          </span>
        </p>
      </article>
    </div>
  );
}

export default async function MessagePage() {
  const [homePayload, pagesPayload] = await Promise.all([
    publicApi<HomeData>("/public/content/home"),
    publicApi<PagesResponse>("/public/content/pages"),
  ]);
  const home = homePayload?.data;
  const messages = home?.messages ?? [];
  const schoolName = home?.school?.nameBn;

  const headTeacher =
    messages.find((m) => m.designationBn.includes("প্রধান শিক্ষক")) ??
    messages[0];
  const chairman = messages.find(
    (m) => m !== headTeacher && m.designationBn.includes("সভাপতি"),
  );
  const others = messages.filter((m) => m !== headTeacher && m !== chairman);

  const pageRecord = pagesPayload?.data.find(
    (item) => item.slug === "headteacher-message",
  );
  const hasAnyMessage = messages.length > 0 || Boolean(pageRecord?.body);

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            প্রধান শিক্ষকের বাণী
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>প্রশাসন</span>
            <span className="sep">›</span>
            <span className="cur">প্রধান শিক্ষকের বাণী</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {!hasAnyMessage && (
          <div className="a-empty">বাণী এখনো প্রকাশিত হয়নি।</div>
        )}

        {headTeacher && (
          <MessageBlock message={headTeacher} schoolName={schoolName} />
        )}

        {!headTeacher && pageRecord?.body && (
          <div className="msg-layout" style={{ marginBottom: 26 }}>
            <article
              className="card prose"
              style={{ padding: 28, gridColumn: "1 / -1" }}
            >
              <div className="quote-mark">“</div>
              {pageRecord.excerpt && (
                <p className="lead">{pageRecord.excerpt}</p>
              )}
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(pageRecord.body),
                }}
              />
            </article>
          </div>
        )}

        {chairman && (
          <>
            <div className="sec-head">
              <h2 className="sec-title">সভাপতির বাণী</h2>
            </div>
            <MessageBlock message={chairman} schoolName={schoolName} />
          </>
        )}

        {others.map((message) => (
          <MessageBlock
            key={`${message.personNameBn}-${message.designationBn}`}
            message={message}
            schoolName={schoolName}
          />
        ))}
      </div>
    </PublicShell>
  );
}
