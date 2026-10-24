import Link from "next/link";
import PublicShell from "@/components/site-chrome";
import { publicApi, type PublicTeachersResponse } from "@/lib/api";
import TeachersBrowser from "./teachers-browser";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "শিক্ষকবৃন্দ",
  description: "বিদ্যালয়ের শিক্ষকদের তালিকা, পদবি ও বিষয়ভিত্তিক পরিচিতি।",
  alternates: { canonical: "/teachers" },
  openGraph: { title: "শিক্ষকবৃন্দ", description: "বিদ্যালয়ের শিক্ষকদের তালিকা, পদবি ও বিষয়ভিত্তিক পরিচিতি।", url: "/teachers" },
};

export default async function TeachersPage() {
  const payload = await publicApi<PublicTeachersResponse>("/public/teachers");
  const teachers = [...(payload?.data ?? [])].sort(
    (a, b) => a.joiningOrder - b.joiningOrder,
  );

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M22 9 12 4 2 9l10 5 10-5ZM6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5M22 9v5" /></svg>
            শিক্ষকবৃন্দ
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>প্রশাসন</span>
            <span className="sep">›</span>
            <span className="cur">শিক্ষকবৃন্দ</span>
          </nav>
        </div>
      </div>
      <main className="container page-body">
        {teachers.length > 0 ? (
          <TeachersBrowser teachers={teachers} />
        ) : (
          <p className="small muted center">শিক্ষকদের তালিকা এখনো প্রকাশিত হয়নি।</p>
        )}
      </main>
    </PublicShell>
  );
}
