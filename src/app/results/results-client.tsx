"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicExam, PublicResultRow } from "@/lib/api";
import { toBn } from "@/lib/bn";

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
}: {
  exams: PublicExam[];
  rows: PublicResultRow[];
  examId: string | null;
  classId: string | null;
}) {
  const router = useRouter();
  const [selExam, setSelExam] = useState<string>(examId ?? "");
  const [selClass, setSelClass] = useState<string>(classId ?? "all");

  const classOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const exam of exams) {
      if (exam.classId && !seen.has(exam.classId)) {
        seen.set(exam.classId, exam.classNameBn ?? "শ্রেণি");
      }
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  }, [exams]);

  const summary = useMemo(() => {
    const total = rows.length;
    const passed = rows.filter((r) => r.isPassed).length;
    const gpaFive = rows.filter((r) => Number.parseFloat(r.gpa) >= 5).length;
    const avg =
      total > 0
        ? rows.reduce((sum, r) => sum + (Number.parseFloat(r.gpa) || 0), 0) / total
        : 0;
    const passPct = total > 0 ? (passed / total) * 100 : 0;
    return { total, passed, gpaFive, avg, passPct };
  }, [rows]);

  if (exams.length === 0) {
    return (
      <div className="alert alert-blue">
        <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
        <span>এখনো কোনো ফলাফল প্রকাশিত হয়নি। ফলাফল প্রকাশ হলে এখানে শ্রেণিভিত্তিক তালিকা দেখা যাবে।</span>
      </div>
    );
  }

  return (
    <>
      <div className="card filter-card">
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
              onChange={(e) => setSelExam(e.target.value)}
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
          <div className="summary-row">
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

          <div className="tbl-wrap">
            <table className="data ct">
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
                {rows.map((row, index) => (
                  <tr key={`${row.registrationNumber ?? row.nameBn}-${index}`}>
                    <td data-label="মেধাক্রম" className="num">
                      {row.meritPosition != null ? toBn(row.meritPosition) : "—"}
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
                      <span className={`chip ${row.isPassed ? "chip-green" : "chip-red"}`}>
                        {row.isPassed ? "উত্তীর্ণ" : "অনুত্তীর্ণ"}
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

          <div style={{ marginTop: 14 }}>
            <button className="btn btn-outline btn-sm" type="button" onClick={() => window.print()}>
              <svg className="icon" viewBox="0 0 24 24" width="16"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2m-12-3h12v6H6z" /></svg>
              প্রিন্ট করুন
            </button>
          </div>
        </>
      ) : (
        <div className="alert alert-blue">
          <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
          <span>নির্বাচিত পরীক্ষা/শ্রেণির জন্য কোনো ফলাফল পাওয়া যায়নি।</span>
        </div>
      )}
    </>
  );
}
