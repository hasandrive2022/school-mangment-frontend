/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import PublicShell from "@/components/site-chrome";
import { publicApi, type HomeData, type PublicStudentsResponse } from "@/lib/api";
import { toBn } from "@/lib/bn";
import StudentsBrowser from "./students-browser";

const BOOK_ICON = (
  <svg className="icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13ZM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></svg>
);

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ছাত্র তালিকা",
  description: "শ্রেণি ও শাখাভিত্তিক শিক্ষার্থীদের তালিকা।",
  alternates: { canonical: "/students" },
  openGraph: { title: "ছাত্র তালিকা", description: "শ্রেণি ও শাখাভিত্তিক শিক্ষার্থীদের তালিকা।", url: "/students" },
};

export default async function StudentsPage() {
  const [homePayload, studentsPayload] = await Promise.all([
    publicApi<HomeData>("/public/content/home"),
    publicApi<PublicStudentsResponse>("/public/students"),
  ]);
  const data = homePayload?.data;
  const meritorious = data?.meritoriousStudents ?? [];
  const students = studentsPayload?.data ?? [];
  const counts = studentsPayload?.counts ?? [];
  const totalFromCounts = counts.reduce((sum, c) => sum + c.count, 0);
  const totalStudents = studentsPayload ? totalFromCounts : (data?.stats?.students ?? null);

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7.5" r="3.5" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M15.5 4.1a3.5 3.5 0 0 1 0 6.8" /></svg>
            ছাত্র তালিকা
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>একাডেমিক</span>
            <span className="sep">›</span>
            <span className="cur">ছাত্র তালিকা</span>
          </nav>
        </div>
      </div>
      <main className="container page-body">
        {(counts.length > 0 || totalStudents != null) && (
          <div className="summary-row">
            {counts.map((c) => (
              <div className="fact" key={c.classId ?? c.classBn ?? "class"}>
                <div className="fi">{BOOK_ICON}</div>
                <div>
                  <b>{toBn(c.count)} জন</b>
                  <span>{c.classBn ?? "শ্রেণি"}</span>
                </div>
              </div>
            ))}
            <div className="fact">
              <div className="fi green">
                <svg className="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7.5" r="3.5" /></svg>
              </div>
              <div>
                <b>{totalStudents != null ? `${toBn(totalStudents)} জন` : "—"}</b>
                <span>সর্বমোট শিক্ষার্থী</span>
              </div>
            </div>
          </div>
        )}

        <div className="sec-head">
          <h2 className="sec-title">কৃতি শিক্ষার্থী</h2>
        </div>
        {meritorious.length > 0 ? (
          <div className="person-grid c3" style={{ marginBottom: 26 }}>
            {meritorious.map((student, index) => (
              <div className="pcard" key={student.id}>
                <div className="phwrap">
                  {student.photoUrl ? (
                    <div className="ph">
                      <img src={student.photoUrl} alt={`${student.nameBn}র ছবি`} loading="lazy" />
                    </div>
                  ) : (
                    <div className={`ph ph-txt${index % 2 === 1 ? " green" : ""}`}>
                      <span>{student.nameBn?.charAt(0) ?? "শি"}</span>
                    </div>
                  )}
                  {student.gpa != null && (
                    <span className="gpa-badge">GPA {toBn(student.gpa)}</span>
                  )}
                </div>
                <h3>{student.nameBn}</h3>
                {student.totalMarks != null && (
                  <div className="desig">মোট নম্বর {toBn(student.totalMarks)}</div>
                )}
                {student.registrationNumber && (
                  <div className="meta">
                    <span>রেজি. নং: {toBn(student.registrationNumber)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="small muted" style={{ marginBottom: 26 }}>কৃতি শিক্ষার্থীদের তালিকা এখনো প্রকাশিত হয়নি।</p>
        )}

        <div className="sec-head">
          <h2 className="sec-title">শ্রেণিভিত্তিক শিক্ষার্থী তালিকা</h2>
        </div>
        {students.length > 0 ? (
          <StudentsBrowser students={students} counts={counts} />
        ) : (
          <p className="small muted">শিক্ষার্থী তালিকা এখনো প্রকাশিত হয়নি।</p>
        )}
      </main>
    </PublicShell>
  );
}
