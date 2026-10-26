"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HomeData, PublicExam, PublicResultRow } from "@/lib/api";
import { toBn } from "@/lib/bn";

/**
 * Pass/fail derived from the grading outcome (Round 6, P7): a student
 * with a passing letter grade and GPA > 0 (e.g. GPA 3.20 / A-) is উত্তীর্ণ
 * even if a stale backend isPassed flag says otherwise. "F" always fails.
 */
function derivedPassed(row: PublicResultRow): boolean {
  const gpa = Number.parseFloat(row.gpa);
  const letter = row.letter?.trim().toUpperCase();
  if (letter && letter !== "F" && Number.isFinite(gpa) && gpa > 0) return true;
  if (letter === "F") return false;
  return row.isPassed;
}

function examLabel(exam: PublicExam): string {
  const parts = [exam.nameBn];
  if (exam.classNameBn) parts.push(exam.classNameBn);
  if (exam.sessionYear != null && exam.sessionYear !== "") {
    parts.push(String(exam.sessionYear));
  }
  return parts.join(" · ");
}

export function ResultsClient({
  exams,
  rows,
  examId,
  classId,
  school,
}: {
  exams: PublicExam[];
  rows: PublicResultRow[];
  examId: string | null;
  classId: string | null;
  school: NonNullable<HomeData["data"]["school"]> | null;
}) {
  const router = useRouter();
  // Filter defaults (Round 6, P7): the exam selector must reflect the
  // exam whose rows are actually shown (the server resolves the latest
  // published exam and returns its id) — never an empty value that makes
  // the browser display the first option while state says otherwise.
  const [selExam, setSelExam] = useState<string>(examId ?? exams[0]?.id ?? "");
  const [selClass, setSelClass] = useState<string>(classId ?? "all");
  const [printDate, setPrintDate] = useState("");

  // Class options are scoped to the SELECTED exam (each exam belongs to
  // one class) so the class filter can never contradict the exam filter.
  const classOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const exam of exams) {
      if (selExam && exam.id !== selExam) continue;
      if (exam.classId && !seen.has(exam.classId)) {
        seen.set(exam.classId, exam.classNameBn ?? "শ্রেণি");
      }
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  }, [exams, selExam]);

  // Merit (মেধাক্রম) — dense rank by total marks within exam+class,
  // computed here so the column is never all-zero (Round 6, P7). Rows
  // are already a single exam's set; group by class so a mixed-class
  // view still ranks within each class.
  const rankedRows = useMemo(() => {
    const totalsByClass = new Map<string, number[]>();
    for (const row of rows) {
      const key = row.classId ?? "";
      const totals = totalsByClass.get(key) ?? [];
      if (!totals.includes(row.totalMarks)) totals.push(row.totalMarks);
      totalsByClass.set(key, totals);
    }
    for (const totals of totalsByClass.values()) {
      totals.sort((a, b) => b - a);
    }
    return rows.map((row) => ({
      row,
      merit: (totalsByClass.get(row.classId ?? "") ?? []).indexOf(row.totalMarks) + 1,
      passed: derivedPassed(row),
    }));
  }, [rows]);

  const summary = useMemo(() => {
    const total = rows.length;
    const passed = rankedRows.filter((r) => r.passed).length;
    const gpaFive = rows.filter((r) => Number.parseFloat(r.gpa) >= 5).length;
    const avg =
      total > 0
        ? rows.reduce((sum, r) => sum + (Number.parseFloat(r.gpa) || 0), 0) / total
        : 0;
    const passPct = total > 0 ? (passed / total) * 100 : 0;
    return { total, passed, gpaFive, avg, passPct };
  }, [rows, rankedRows]);

  const selectedExam = exams.find((exam) => exam.id === selExam);
  const selectedClassLabel =
    selClass === "all"
      ? selectedExam?.classNameBn ?? "সকল শ্রেণি"
      : classOptions.find((option) => option.id === selClass)?.label ??
        "নির্বাচিত শ্রেণি";
  const printResults = () => {
    setPrintDate(
      new Intl.DateTimeFormat("bn-BD", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date()),
    );
    window.requestAnimationFrame(() => window.print());
  };

  if (exams.length === 0) {
    return (
      <div className="alert alert-blue">
        <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
        <span>এখনো কোনো ফলাফল প্রকাশিত হয়নি। ফলাফল প্রকাশ হলে এখানে শ্রেণিভিত্তিক তালিকা দেখা যাবে।</span>
      </div>
    );
  }

  return (
    <div className="results-report">
      <header className="results-print-header">
        <div className="results-print-identity">
          {school?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="results-print-logo" src={school.logoUrl} alt="" />
          ) : null}
          <div className="results-print-school-copy">
            <h1>{school?.nameBn || "বিদ্যালয়"}</h1>
            {school?.nameEn ? <p className="results-print-school-en">{school.nameEn}</p> : null}
            <p className="results-print-school-meta">
              {[school?.address, school?.eiin ? `EIIN: ${toBn(school.eiin)}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="results-print-title">
          <span>বিদ্যালয়ের একাডেমিক প্রতিবেদন</span>
          <h2>পরীক্ষার ফলাফল</h2>
        </div>
        <dl className="results-print-meta">
          <div>
            <dt>পরীক্ষা</dt>
            <dd>{selectedExam?.nameBn ?? "প্রকাশিত পরীক্ষা"}</dd>
          </div>
          <div>
            <dt>শিক্ষাবর্ষ</dt>
            <dd>{selectedExam?.sessionYear != null ? toBn(selectedExam.sessionYear) : "—"}</dd>
          </div>
          <div>
            <dt>শ্রেণি</dt>
            <dd>{selectedClassLabel}</dd>
          </div>
        </dl>
        <p className="results-print-date">মুদ্রণের তারিখ: {printDate || "—"}</p>
      </header>
      <div className="card filter-card results-filter-card">
        <form
          className="filter-grid f3"
          onSubmit={(e) => {
            e.preventDefault();
            const query = new URLSearchParams();
            if (selExam) query.set("examId", selExam);
            if (selClass !== "all") query.set("classId", selClass);
            const qs = query.toString();
            router.push(qs ? `/results?${qs}` : "/results");
          }}
        >
          <div className="field">
            <label htmlFor="rlExam">পরীক্ষা</label>
            <select
              id="rlExam"
              value={selExam}
              onChange={(e) => {
                setSelExam(e.target.value);
                setSelClass("all");
              }}
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {examLabel(exam)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rlClass">শ্রেণি</label>
            <select
              id="rlClass"
              value={selClass}
              onChange={(e) => setSelClass(e.target.value)}
            >
              <option value="all">সব শ্রেণি</option>
              {classOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            ফলাফল দেখুন
          </button>
        </form>
      </div>

      {rows.length > 0 ? (
        <>
          <div className="summary-row results-summary">
            <div className="fact">
              <div className="fi">
                <svg className="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7.5" r="3.5" /></svg>
              </div>
              <div><b>{toBn(summary.total)} জন</b><span>মোট পরীক্ষার্থী</span></div>
            </div>
            <div className="fact">
              <div className="fi green">
                <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><path d="M22 4 12 14l-3-3)" /></svg>
              </div>
              <div>
                <b>{toBn(summary.passed)} জন</b>
                <span>উত্তীর্ণ ({toBn(summary.passPct.toFixed(1))}%)</span>
              </div>
            </div>
            <div className="fact">
              <div className="fi green">
                <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="9" r="6" /><path d="m8.5 14-2 8 5.5-3 5.5 3-2-8" /></svg>
              </div>
              <div><b>{toBn(summary.gpaFive)} জন</b><span>GPA-৫.০০ প্রাপ্ত</span></div>
            </div>
            <div className="fact">
              <div className="fi">
                <svg className="icon" viewBox="0 0 24 24"><path d="M3 3v18h18M8 17v-6M13 17V7M18 17v-9" /></svg>
              </div>
              <div><b>{toBn(summary.avg.toFixed(2))}</b><span>গড় GPA</span></div>
            </div>
          </div>

          <div className="tbl-wrap results-table-wrap">
            <table className="data ct results-print-table">
              <thead>
                <tr>
                  <th>মেধাক্রম</th>
                  <th>শিক্ষার্থী</th>
                  <th>রেজি. নং</th>
                  <th>মোট নম্বর</th>
                  <th>GPA</th>
                  <th>গ্রেড</th>
                  <th>অবস্থা</th>
                  <th>মার্কশিট</th>
                </tr>
              </thead>
              <tbody>
                {rankedRows.map(({ row, merit, passed }, index) => (
                  <tr key={`${row.registrationNumber ?? row.nameBn}-${index}`}>
                    <td data-label="মেধাক্রম" className="num">
                      {toBn(merit)}
                    </td>
                    <td className="cell-main" data-label="শিক্ষার্থী">
                      <div className="cell-person">
                        <span className="avatar av-txt">{row.nameBn?.charAt(0) ?? "শি"}</span>
                        <b>{row.nameBn}</b>
                      </div>
                    </td>
                    <td data-label="রেজি. নং" className="num">
                      {row.registrationNumber ? toBn(row.registrationNumber) : "—"}
                    </td>
                    <td data-label="মোট নম্বর" className="num">{toBn(row.totalMarks)}</td>
                    <td data-label="GPA">
                      <b style={{ color: "var(--a600)" }}>{toBn(row.gpa)}</b>
                    </td>
                    <td data-label="গ্রেড">{row.letter}</td>
                    <td data-label="অবস্থা">
                      <span className={`chip ${passed ? "chip-green" : "chip-red"}`}>
                        {passed ? "উত্তীর্ণ" : "অনুত্তীর্ণ"}
                      </span>
                    </td>
                    <td data-label="মার্কশিট">
                      {row.registrationNumber ? (
                        <Link
                          className="btn btn-outline btn-sm"
                          href={`/result-search?registrationNumber=${encodeURIComponent(row.registrationNumber)}`}
                        >
                          দেখুন
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="results-print-approval">
            <div className="results-signoff">
              <span className="results-signoff-line" />
              <strong>প্রধান শিক্ষক/শিক্ষিকা</strong>
            </div>
            <div className="results-signoff">
              <span className="results-signoff-line" />
              <strong>বিদ্যালয়ের সীল</strong>
            </div>
          </div>
          <p className="results-print-note">
            এই প্রতিবেদনটি নির্বাচিত পরীক্ষা ও শ্রেণির প্রকাশিত ফলাফলের ভিত্তিতে তৈরি।
          </p>
          <div className="results-print-action">
            <p>প্রিন্ট ডায়ালগে “Save as PDF” নির্বাচন করে PDF সংরক্ষণ করুন।</p>
            <button className="btn btn-outline btn-sm" type="button" onClick={printResults}>
              <svg className="icon" viewBox="0 0 24 24" width="16"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5h-2m-12-3h12v6H6z" /></svg>
              সব ফলাফল প্রিন্ট করুন
            </button>
          </div>
        </>
      ) : (
        <div className="alert alert-blue">
          <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
          <span>নির্বাচিত পরীক্ষা/শ্রেণির জন্য কোনো ফলাফল পাওয়া যায়নি।</span>
        </div>
      )}
    </div>
  );
}
