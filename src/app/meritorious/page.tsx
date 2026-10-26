/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { publicApi, type HomeData } from "@/lib/api";
import { toBn } from "@/lib/bn";
import PublicShell from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "কৃতি শিক্ষার্থী",
  description: "সর্বশেষ প্রকাশিত ফলাফলে মেধা তালিকায় স্থান পাওয়া কৃতি শিক্ষার্থীবৃন্দ।",
};

export default async function MeritoriousPage() {
  const homePayload = await publicApi<HomeData>("/public/content/home");
  const students = homePayload?.data?.meritoriousStudents ?? [];
  const gpaFiveCount = students.filter((s) => {
    if (s.gpa == null) return false;
    const value = Number.parseFloat(String(s.gpa));
    return !Number.isNaN(value) && value >= 5;
  }).length;

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24">
              <circle cx="12" cy="9" r="6" />
              <path d="m8.5 14-2 8 5.5-3 5.5 3-2-8" />
            </svg>
            কৃতি শিক্ষার্থী
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>ফলাফল</span>
            <span className="sep">›</span>
            <span className="cur">কৃতি শিক্ষার্থী</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {students.length > 0 ? (
          <>
            <div className="alert alert-green">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" />
                <path d="M22 4 12 14l-3-3" />
              </svg>
              <span>
                সর্বশেষ প্রকাশিত ফলাফলের মেধা তালিকা থেকে{" "}
                <b>{toBn(students.length)} জন</b> কৃতি শিক্ষার্থী এখানে দেখানো
                হয়েছে
                {gpaFiveCount > 0 && (
                  <>
                    {" "}
                    — যাদের মধ্যে <b>{toBn(gpaFiveCount)} জন</b> GPA-৫.০০
                    অর্জন করেছে
                  </>
                )}
                । সবাইকে বিদ্যালয়ের পক্ষ থেকে অভিনন্দন!
              </span>
            </div>
            <div className="person-grid c3">
              {students.map((student, index) => (
                <div className="pcard" key={student.id}>
                  <div className="phwrap">
                    {student.photoUrl ? (
                      <div className="ph">
                        <img
                          src={student.photoUrl}
                          alt={`${student.nameBn}র ছবি`}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div
                        className={`ph ph-txt${index % 2 === 1 ? " green" : ""}`}
                      >
                        <span>{student.nameBn?.charAt(0) ?? "শি"}</span>
                      </div>
                    )}
                    {student.gpa != null && (
                      <span className="gpa-badge">
                        GPA {toBn(student.gpa)}
                      </span>
                    )}
                  </div>
                  <h3>{student.nameBn}</h3>
                  {student.totalMarks != null && (
                    <div className="desig">
                      মোট নম্বর {toBn(student.totalMarks)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="small muted" style={{ marginTop: 14 }}>
              মেধাক্রম, শ্রেণি ও পরীক্ষার নাম প্রকাশিত তথ্যে থাকলে এখানে
              দেখানো হতো — বর্তমান তথ্যে সেগুলো নেই, তাই বাদ দেওয়া হয়েছে।
              পূর্ণাঙ্গ ফলাফল দেখতে{" "}
              <Link href="/results">ফলাফল তালিকা</Link> পেজে যান।
            </p>
          </>
        ) : (
          <div className="a-empty">
            কৃতি শিক্ষার্থীদের তালিকা এখনো প্রকাশিত হয়নি — ফলাফল প্রকাশের পর
            মেধা তালিকা থেকে এখানে দেখানো হবে।
          </div>
        )}
      </div>
    </PublicShell>
  );
}
