import Link from "next/link";
import { publicApi } from "@/lib/api";
import { bnDay, bnMonthYear, bnDate } from "@/lib/bn";
import PublicShell from "@/components/site-chrome";

type EventRow = {
  id: string;
  titleBn?: string | null;
  details?: string | null;
  startsAt?: string | null;
  venue?: string | null;
};

type Response = { data: EventRow[] };

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "অনুষ্ঠান",
  description: "বিদ্যালয়ের আসন্ন ও অতীত অনুষ্ঠানসমূহের তালিকা।",
  alternates: { canonical: "/events" },
  openGraph: { title: "অনুষ্ঠান", description: "বিদ্যালয়ের আসন্ন ও অতীত অনুষ্ঠানসমূহের তালিকা।", url: "/events" },
};

export default async function EventsPage() {
  const payload = await publicApi<Response>("/public/content/events");
  const rows = payload?.data ?? [];

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /></svg>
            অনুষ্ঠান
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span className="cur">অনুষ্ঠান</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {rows.length > 0 ? (
          <div className="notice-list">
            {rows.map((item) => (
              <article className="nitem" key={item.id} style={{ cursor: "default" }}>
                {item.startsAt && (
                  <div className="date-badge">
                    <b>{bnDay(item.startsAt)}</b>
                    <span>{bnMonthYear(item.startsAt).split(" ")[0]}</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3>{item.titleBn ?? "অনুষ্ঠান"}</h3>
                  {item.details && <p>{stripTags(item.details)}</p>}
                  <div className="nmeta">
                    {item.startsAt && <span className="chip">{bnDate(item.startsAt)}</span>}
                    {item.venue && <span className="chip chip-gray">{item.venue}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="a-empty">কোনো প্রকাশিত তথ্য নেই।</div>
        )}
      </div>
    </PublicShell>
  );
}
