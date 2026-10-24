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

type ResultPayload = {
  result?: {
    totalMarks: number;
    gpa: string;
    letter: string;
    isPassed: boolean;
    meritPosition: number | null;
    subjects?: SubjectMark[];
  };
  exam?: { nameBn: string };
  student?: { nameBn?: string; registrationNumber?: string };
  subjects?: SubjectMark[];
};

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
  const [payload, setPayload] = useState<ResultPayload | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const autoRan = useRef(false);

  async function search(reg: string) {
    const value = reg.trim();
    if (!value) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/public-results?registrationNumber=${encodeURIComponent(value)}`);
      setPayload((await response.json()) as ResultPayload);
    } catch {
      setPayload(null);
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
      <div className="card filter-card" style={{ maxWidth: 860, marginLeft: "auto", marginRight: "auto" }}>
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
        {searched && !loading && !result && (
          <div className="alert alert-red" style={{ margin: "14px 0 0" }}>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5h.01" /></svg>
            <span>দুঃখিত — এই রেজিস্ট্রেশন নম্বরের কোনো ফলাফল পাওয়া যায়নি। নম্বরটি যাচাই করে আবার চেষ্টা করুন।</span>
          </div>
        )}
      </div>

      {result && (
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 12, flexWrap: "wrap" }}>
            <button className="btn btn-outline btn-sm" type="button" onClick={() => window.print()}>
              <svg className="icon" viewBox="0 0 24 24" width="16"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2m-12-3h12v6H6z" /></svg>
              প্রিন্ট করুন
            </button>
          </div>
          <div className="marksheet">
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
                  <span style={{ color: result.isPassed ? "var(--a600)" : "var(--danger)", fontWeight: 700 }}>
                    {result.isPassed ? "উত্তীর্ণ" : "অনুত্তীর্ণ"}
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
