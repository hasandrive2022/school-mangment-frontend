"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toBn } from "@/lib/bn";

type SubjectMark = {
  subjectNameBn?: string;
  nameBn?: string;
  fullMarks?: number;
  obtainedMarks?: number;
  marks?: number;
  letter?: string;
  grade?: string;
  gradePoint?: number | string;
  gpa?: number | string;
};

type ResultData = {
  totalMarks: number;
  gpa: string;
  letter: string;
  isPassed: boolean;
  meritPosition: number | null;
  subjects?: SubjectMark[];
};

/**
 * Result-search response contract (Round 6, P2) — coded defensively
 * against the backend engineer's new shape:
 *
 *   { data: { status: "found", result: {...}, exam: {...}, student: {...}, subjects: [...] } }
 *   { data: { status: "not-found" } }                          // unknown registration number
 *   { data: { status: "not-published" } }                      // student exists, no published result
 *
 * The status/kind field is also accepted at the top level
 * ({ status: "not-found", data: null }) or as `kind` instead of
 * `status`, and the older shape ({ data: { result, exam } } with no
 * status field at all) still works: a present result means "found";
 * without any signal the fallback message is the not-found one.
 */
type SearchStatus = "found" | "not-found" | "not-published" | "error";

type NormalizedResult = {
  status: SearchStatus;
  result?: ResultData;
  exam?: { nameBn: string };
  student?: { nameBn?: string; registrationNumber?: string };
  subjects?: SubjectMark[];
};

function normalizeSearchPayload(raw: unknown): NormalizedResult {
  if (!raw || typeof raw !== "object") return { status: "error" };
  const top = raw as Record<string, unknown>;
  const data = (top.data ?? top) as Record<string, unknown>;
  const statusRaw = String(top.status ?? top.kind ?? data.status ?? data.kind ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  const result = (data.result ?? undefined) as ResultData | undefined;
  const exam = (data.exam ?? undefined) as { nameBn: string } | undefined;
  const student = (data.student ?? undefined) as NormalizedResult["student"];
  const subjects =
    (data.subjects as SubjectMark[] | undefined) ?? result?.subjects;

  if (statusRaw === "not-found" || statusRaw === "notfound" || statusRaw === "student-not-found")
    return { status: "not-found" };
  if (
    statusRaw === "not-published" ||
    statusRaw === "unpublished" ||
    statusRaw === "result-not-published" ||
    statusRaw === "no-published-result" ||
    statusRaw === "nopublishedresult" ||
    statusRaw === "pending"
  )
    return { status: "not-published", student };
  if (result) return { status: "found", result, exam, student, subjects };
  if (statusRaw === "found") return { status: "not-published", student };
  // No explicit signal and no result: cannot distinguish — fall back to
  // the not-found message (the new backend always sends the field).
  return { status: "not-found" };
}

/** Pass/fail from the grading outcome itself (letter/GPA), not a stale flag. */
function derivedPassed(result: ResultData): boolean {
  const gpa = Number.parseFloat(String(result.gpa));
  if (result.letter && result.letter.toUpperCase() !== "F" && Number.isFinite(gpa) && gpa > 0)
    return true;
  if (result.letter && result.letter.toUpperCase() === "F") return false;
  return Boolean(result.isPassed);
}

export function ResultSearchClient({
  schoolName,
  schoolAddress,
  schoolEiin,
}: {
  schoolName: string;
  schoolAddress: string;
  schoolEiin: string;
}) {
  const searchParams = useSearchParams();
  const initialReg = searchParams.get("registrationNumber") ?? "";
  const [registrationNumber, setRegistrationNumber] = useState(initialReg);
  const [payload, setPayload] = useState<NormalizedResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const autoRan = useRef(false);

  async function search(reg: string) {
    const value = reg.trim();
    if (!value) return;
    setLoading(true);
    setPayload(null);
    try {
      const response = await fetch(`/api/public-results?registrationNumber=${encodeURIComponent(value)}`);
      const raw: unknown = await response.json().catch(() => null);
      setPayload(normalizeSearchPayload(raw));
    } catch {
      setPayload({ status: "error" });
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialReg && !autoRan.current) {
      autoRan.current = true;
      void search(initialReg);
    }
  }, [initialReg]);

  const result = payload?.result;
  const subjects = payload?.subjects ?? payload?.result?.subjects;
  const studentName = payload?.student?.nameBn;

  return (
    <>
      <section className="result-search-hero" aria-labelledby="result-search-title">
        <div className="result-search-kicker"><span className="result-search-kicker-dot" /> ডিজিটাল একাডেমিক রেকর্ড</div>
        <h1 id="result-search-title">আপনার ফলাফল, এক নজরে</h1>
        <p>রেজিস্ট্রেশন নম্বর দিয়ে নিরাপদে ফলাফল দেখুন এবং প্রয়োজনে PDF হিসেবে সংরক্ষণ করুন।</p>
      </section>
      <div className="card filter-card result-search-card" style={{ maxWidth: 860, marginLeft: "auto", marginRight: "auto" }}>
        <h3 style={{ fontSize: 18, color: "var(--p800)", marginBottom: 4 }}>রেজিস্ট্রেশন নম্বর দিয়ে ফলাফল খুঁজুন</h3>
        <p className="small muted" style={{ margin: "0 0 14px" }}>লগিন ছাড়াই ফলাফল দেখা যাবে।</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void search(registrationNumber);
          }}
        >
          <div className="rs-grid">
            <div className="field">
              <label htmlFor="rsReg">রেজিস্ট্রেশন নম্বর <i>*</i></label>
              <input
                id="rsReg"
                inputMode="numeric"
                placeholder="যেমন: 26100023"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit" style={{ height: 42 }} disabled={loading}>
              <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              {loading ? "খুঁজছে…" : "খুঁজুন"}
            </button>
          </div>
        </form>
        {searched && !loading && payload?.status === "not-found" && (
          <div className="alert alert-red" style={{ margin: "14px 0 0" }} role="alert">
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5h.01" /></svg>
            <span>এই নম্বরের কোনো শিক্ষার্থী পাওয়া যায়নি। রেজিস্ট্রেশন নম্বরটি যাচাই করে আবার চেষ্টা করুন।</span>
          </div>
        )}
        {searched && !loading && payload?.status === "not-published" && (
          <div className="alert alert-blue" style={{ margin: "14px 0 0" }} role="status">
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
            <span>এই শিক্ষার্থীর ফলাফল এখনো প্রকাশিত হয়নি। ফলাফল প্রকাশিত হলে এখানেই দেখা যাবে — অনুগ্রহ করে পরে আবার চেষ্টা করুন।</span>
          </div>
        )}
        {searched && !loading && payload?.status === "error" && (
          <div className="alert alert-red" style={{ margin: "14px 0 0" }} role="alert">
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5h.01" /></svg>
            <span>ফলাফল খুঁজতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</span>
          </div>
        )}
      </div>

      {result && (
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div className="result-actions" aria-label="ফলাফল সংরক্ষণ করার অপশন">
            <span className="result-actions-note">ফলাফলটি PDF করতে প্রিন্ট অপশন থেকে “Save as PDF” বেছে নিন</span>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => window.print()}>
              <svg className="icon" viewBox="0 0 24 24" width="16"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5h-2m-12-3h12v6H6z" /></svg>
              PDF / প্রিন্ট
            </button>
          </div>
          <div className="marksheet">
            <div className="marksheet-ribbon">VERIFIED ACADEMIC RECORD</div>
            <div className="ms-head">
              <h3>{schoolName}</h3>
              <p>
                {schoolAddress}
                {schoolEiin ? ` · EIIN: ${toBn(schoolEiin)}` : ""}
              </p>
              <span className="ms-title">একাডেমিক নম্বরপত্র{payload?.exam?.nameBn ? ` — ${payload.exam.nameBn}` : ""}</span>
            </div>
            <div className="ms-info">
              {studentName && (
                <div><span>শিক্ষার্থীর নাম</span><b>{studentName}</b></div>
              )}
              <div><span>রেজিস্ট্রেশন নং</span><b>{payload?.student?.registrationNumber ?? registrationNumber}</b></div>
              {payload?.exam?.nameBn && (
                <div><span>পরীক্ষা</span><b>{payload.exam.nameBn}</b></div>
              )}
              <div><span>মেধাক্রম</span><b>{result.meritPosition !== null && result.meritPosition !== undefined ? toBn(result.meritPosition) : "—"}</b></div>
            </div>
            <div className="tbl-wrap" style={{ border: 0, boxShadow: "none" }}>
              <table className="ms">
                {subjects && subjects.length > 0 ? (
                  <>
                    <thead>
                      <tr>
                        <th>ক্রম</th>
                        <th>বিষয়</th>
                        <th className="n">পূর্ণমান</th>
                        <th className="n">প্রাপ্ত নম্বর</th>
                        <th className="n">গ্রেড</th>
                        <th className="n">গ্রেড পয়েন্ট</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s, i) => (
                        <tr key={i}>
                          <td>{toBn(i + 1)}</td>
                          <td>{s.subjectNameBn ?? s.nameBn ?? "বিষয়"}</td>
                          <td className="n">{s.fullMarks !== undefined ? toBn(s.fullMarks) : "—"}</td>
                          <td className="n">{s.obtainedMarks !== undefined ? toBn(s.obtainedMarks) : s.marks !== undefined ? toBn(s.marks) : "—"}</td>
                          <td className="n">{s.letter ?? s.grade ?? "—"}</td>
                          <td className="n">{s.gradePoint !== undefined ? toBn(String(s.gradePoint)) : s.gpa !== undefined ? toBn(String(s.gpa)) : "—"}</td>
                        </tr>
                      ))}
                      <tr style={{ background: "var(--p50)" }}>
                        <td colSpan={2}><b>সর্বমোট</b></td>
                        <td className="n">—</td>
                        <td className="n"><b>{toBn(result.totalMarks)}</b></td>
                        <td className="n" colSpan={2}><b>{result.letter}</b></td>
                      </tr>
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead>
                      <tr>
                        <th>বিবরণ</th>
                        <th className="n">মান</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>মোট নম্বর</td><td className="n"><b>{toBn(result.totalMarks)}</b></td></tr>
                      <tr><td>GPA</td><td className="n"><b>{toBn(result.gpa)}</b></td></tr>
                      <tr><td>গ্রেড</td><td className="n"><b>{result.letter}</b></td></tr>
                      <tr><td>মেধাক্রম</td><td className="n">{result.meritPosition !== null && result.meritPosition !== undefined ? toBn(result.meritPosition) : "—"}</td></tr>
                    </tbody>
                  </>
                )}
              </table>
            </div>
            <div className="ms-foot">
              <div>
                <p style={{ margin: "0 0 4px" }}>
                  <b>ফলাফল:</b>{" "}
                  <span style={{ color: derivedPassed(result) ? "var(--a600)" : "var(--danger)", fontWeight: 700 }}>
                    {derivedPassed(result) ? "উত্তীর্ণ" : "অনুত্তীর্ণ"}
                  </span>
                </p>
                <p style={{ margin: 0 }}>
                  <b>মেধাক্রম:</b> {result.meritPosition !== null && result.meritPosition !== undefined ? `${toBn(result.meritPosition)} (শ্রেণিতে)` : "—"}
                </p>
              </div>
              <div className="gpa-box">
                <span>মোট GPA</span>
                <b>{toBn(result.gpa)}</b>
                <span>৫.০০ এর মধ্যে</span>
              </div>
            </div>
            <div className="ms-sign">
              <div><i></i>শ্রেণি শিক্ষকের স্বাক্ষর</div>
              <div><i></i>পরীক্ষা নিয়ন্ত্রক</div>
              <div><i></i>প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
