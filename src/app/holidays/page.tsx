import Link from "next/link";
import { publicApi, type HolidaysResponse } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { toBn } from "@/lib/bn";
import PublicShell from "@/components/site-chrome";

type PagesResponse = {
  data: Array<{ id: string; slug: string; titleBn: string; body: string }>;
};

/** Parse a 'YYYY-MM-DD' date-only string as a local date (no TZ shift). */
function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function fmtFull(d: Date): string {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function fmtDayMonth(d: Date): string {
  return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long" }).format(d);
}

function fmtWeekday(d: Date): string {
  return new Intl.DateTimeFormat("bn-BD", { weekday: "long" }).format(d);
}

function fmtWeekdayShort(d: Date): string {
  return new Intl.DateTimeFormat("bn-BD", { weekday: "short" }).format(d);
}

function dateCell(fromDate: string, toDate: string): string {
  const from = parseDateOnly(fromDate);
  const to = parseDateOnly(toDate);
  if (!from) return toBn(fromDate);
  if (!to || fromDate === toDate) return fmtFull(from);
  if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()) {
    return `${toBn(from.getDate())}–${fmtFull(to)}`;
  }
  if (from.getFullYear() === to.getFullYear()) {
    return `${fmtDayMonth(from)} – ${fmtFull(to)}`;
  }
  return `${fmtFull(from)} – ${fmtFull(to)}`;
}

function weekdayCell(fromDate: string, toDate: string): string {
  const from = parseDateOnly(fromDate);
  const to = parseDateOnly(toDate);
  if (!from) return "—";
  if (!to || fromDate === toDate) return fmtWeekday(from);
  return `${fmtWeekdayShort(from)}–${fmtWeekdayShort(to)}`;
}

export default async function HolidaysPage() {
  const [holidaysPayload, pagesPayload] = await Promise.all([
    publicApi<HolidaysResponse>("/public/content/holidays"),
    publicApi<PagesResponse>("/public/content/pages"),
  ]);
  const holidays = holidaysPayload?.data ?? [];
  const holidayPage = pagesPayload?.data.find((item) => item.slug.includes("holiday"));

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /></svg>
            ছুটির তালিকা
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>একাডেমিক</span>
            <span className="sep">›</span>
            <span className="cur">ছুটির তালিকা</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {holidays.length > 0 ? (
          <>
            <div className="alert alert-blue">
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
              <span>সরকারি ছুটির তালিকা ও শিক্ষা মন্ত্রণালয়ের ছুটির ক্যালেন্ডার অনুযায়ী ছুটির তালিকা প্রকাশ করা হয়।</span>
            </div>
            <div className="tbl-wrap">
              <table className="data ct">
                <thead>
                  <tr><th>তারিখ</th><th>বার</th><th>উপলক্ষ</th><th>ছুটির দিন</th></tr>
                </thead>
                <tbody>
                  {holidays.map((holiday) => (
                    <tr key={holiday.id}>
                      <td data-label="তারিখ">{dateCell(holiday.fromDate, holiday.toDate)}</td>
                      <td data-label="বার">{weekdayCell(holiday.fromDate, holiday.toDate)}</td>
                      <td data-label="উপলক্ষ"><b>{holiday.titleBn}</b></td>
                      <td data-label="ছুটির দিন" className="num">{toBn(holiday.dayCount)} দিন</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : holidayPage?.body ? (
          <article className="card prose" style={{ padding: 26 }}>
            <h3 style={{ marginTop: 0 }}>{holidayPage.titleBn}</h3>
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(holidayPage.body) }} />
          </article>
        ) : (
          <>
            <div className="alert alert-blue">
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
              <span>সরকারি ছুটির তালিকা ও শিক্ষা মন্ত্রণালয়ের ছুটির ক্যালেন্ডার অনুযায়ী ছুটির তালিকা প্রকাশ করা হয়।</span>
            </div>
            <div className="tbl-wrap">
              <table className="data ct">
                <thead>
                  <tr><th>তারিখ</th><th>বার</th><th>উপলক্ষ</th><th>ছুটির দিন</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--ink2)" }}>কোনো প্রকাশিত তথ্য নেই।</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PublicShell>
  );
}
