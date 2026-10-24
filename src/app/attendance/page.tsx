import Link from "next/link";
import PublicShell from "@/components/site-chrome";
import {
  publicApi,
  type PublicStudentsResponse,
} from "@/lib/api";
import { bnDate, toBn } from "@/lib/bn";

type Row = {
  date: string;
  status: string;
  registrationNumber: string | null;
  nameBn: string;
};

function statusOf(status: string): {
  label: string;
  mark: string;
  markClass: string;
  chipClass: string;
} {
  if (status === "PRESENT")
    return {
      label: "উপস্থিত",
      mark: "✓",
      markClass: "mark-p",
      chipClass: "chip-green",
    };
  if (status === "LEAVE")
    return {
      label: "ছুটি",
      mark: "ছ",
      markClass: "mark-l",
      chipClass: "chip-amber",
    };
  return {
    label: "অনুপস্থিত",
    mark: "✗",
    markClass: "mark-a",
    chipClass: "chip-red",
  };
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; classId?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.date) query.set("date", params.date);
  if (params.classId) query.set("classId", params.classId);
  const qs = query.toString();

  const [payload, studentsPayload] = await Promise.all([
    publicApi<{ data: Row[] }>(`/public/attendance${qs ? `?${qs}` : ""}`, { cache: "no-store" }),
    publicApi<PublicStudentsResponse>("/public/students"),
  ]);
  const rows = payload?.data ?? [];
  const classOptions = studentsPayload?.counts ?? [];
  const present = rows.filter((r) => r.status === "PRESENT").length;
  const leave = rows.filter((r) => r.status === "LEAVE").length;
  const absent = rows.length - present - leave;
  const rate =
    rows.length > 0 ? Math.round((present / rows.length) * 100) : null;
  const selectedClass = classOptions.find((c) => c.classId === params.classId);

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            হাজিরা বিবরণী
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>একাডেমিক</span>
            <span className="sep">›</span>
            <span className="cur">দৈনিক হাজিরা</span>
          </nav>
        </div>
      </div>
      <main className="container page-body">
        <div className="card filter-card">
          <form className="filter-grid f3" method="get">
            <div className="field">
              <label htmlFor="att-class">শ্রেণি</label>
              <select id="att-class" name="classId" defaultValue={params.classId ?? ""}>
                <option value="">সব শ্রেণি</option>
                {classOptions.map((c) => (
                  <option key={c.classId ?? c.classBn ?? "class"} value={c.classId ?? ""}>
                    {c.classBn ?? "শ্রেণি"}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="att-date">তারিখ</label>
              <input id="att-date" type="date" name="date" defaultValue={params.date ?? ""} />
            </div>
            <button className="btn btn-primary" type="submit">
              হাজিরা দেখুন
            </button>
          </form>
        </div>

        <div className="summary-row">
          <div className="fact">
            <div className="fi">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9.5" cy="7.5" r="3.5" />
              </svg>
            </div>
            <div>
              <b>{toBn(rows.length)} জন</b>
              <span>মোট শিক্ষার্থী</span>
            </div>
          </div>
          <div className="fact">
            <div className="fi green">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <b>{toBn(present)} জন</b>
              <span>উপস্থিত</span>
            </div>
          </div>
          <div className="fact">
            <div className="fi">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </div>
            <div>
              <b>{toBn(absent)} জন</b>
              <span>অনুপস্থিত</span>
            </div>
          </div>
          <div className="fact">
            <div className="fi green">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 3v18h18M8 17v-6M13 17V7M18 17v-9" />
              </svg>
            </div>
            <div>
              <b>{rate != null ? `${toBn(rate)}%` : "—"}</b>
              <span>উপস্থিতির হার</span>
            </div>
          </div>
        </div>

        {(selectedClass || params.date || leave > 0) && (
          <p className="small muted" style={{ margin: "0 0 10px" }}>
            {selectedClass && (
              <>
                <b>{selectedClass.classBn}</b>
                {" · "}
              </>
            )}
            {params.date && <>{bnDate(params.date) || params.date} · </>}
            {leave > 0 && <>ছুটিতে: {toBn(leave)} জন</>}
          </p>
        )}

        {rows.length > 0 ? (
          <div className="tbl-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>শিক্ষার্থীর নাম</th>
                  <th>রেজি. নং</th>
                  <th>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const s = statusOf(row.status);
                  return (
                    <tr key={`${row.date}-${row.registrationNumber ?? index}`}>
                      <td className="num">{bnDate(row.date) || row.date}</td>
                      <td>
                        <b>{row.nameBn}</b>
                      </td>
                      <td className="num">{row.registrationNumber ?? "—"}</td>
                      <td>
                        <span className={`mark ${s.markClass}`}>{s.mark}</span>{" "}
                        <span className={`chip ${s.chipClass}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="small muted center">
            কোনো প্রকাশিত হাজিরা তথ্য নেই।
          </p>
        )}
        <p className="small muted" style={{ marginTop: 12 }}>
          শুধুমাত্র সারসংক্ষেপ তথ্য প্রকাশ করা হয় — বিস্তারিত হাজিরা বিবরণী
          শিক্ষার্থী পোর্টালে লগিন করে দেখা যাবে।
        </p>
      </main>
    </PublicShell>
  );
}
