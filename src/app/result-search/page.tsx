import { Suspense } from "react";
import Link from "next/link";
import PublicShell from "@/components/site-chrome";
import { publicApi, type HomeData, type PublicExamsResponse } from "@/lib/api";
import { ResultSearchClient } from "./result-search-client";
import { ResultCountdown } from "./result-countdown";

export default async function ResultSearchPage() {
  const [payload, examsPayload] = await Promise.all([
    publicApi<HomeData>("/public/content/home"),
    publicApi<PublicExamsResponse>("/public/exams"),
  ]);
  const school = payload?.data.school;
  const upcoming = (examsPayload?.data ?? [])
    .filter((e) => e.status === "scheduled" && e.publishAt)
    .sort((a, b) => String(a.publishAt).localeCompare(String(b.publishAt)))[0];
  const upcomingName = upcoming?.nameBn ?? null;
  const upcomingPublishAt = upcoming?.publishAt ?? null;

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="9" r="6" /><path d="m8.5 14-2 8 5.5-3 5.5 3-2-8" /></svg>
            ফলাফল অনুসন্ধান
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>ফলাফল</span>
            <span className="sep">›</span>
            <span className="cur">ফলাফল অনুসন্ধান</span>
          </nav>
        </div>
      </div>
      <main className="container page-body">
        <Suspense fallback={<p className="small muted center">লোড হচ্ছে…</p>}>
          <ResultSearchClient
            schoolName={school?.nameBn ?? "আদর্শ মডেল উচ্চ বিদ্যালয়"}
            schoolAddress={school?.address ?? ""}
            schoolEiin={school?.eiin ?? ""}
          />
        </Suspense>
        {upcomingName && upcomingPublishAt && (
          <ResultCountdown examName={upcomingName} publishAt={upcomingPublishAt} />
        )}
      </main>
    </PublicShell>
  );
}
