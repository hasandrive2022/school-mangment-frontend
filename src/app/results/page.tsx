import { Suspense } from "react";
import Link from "next/link";
import PublicShell from "@/components/site-chrome";
import {
  publicApi,
  type PublicExamsResponse,
  type PublicResultsResponse,
} from "@/lib/api";
import { ResultsClient } from "./results-client";

function ResultsLoading() {
  return (
    <div className="card loading-card" aria-busy="true" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>ফলাফল লোড হচ্ছে…</span>
    </div>
  );
}

async function ResultsContent({
  searchParams,
}: {
  searchParams: Promise<{ examId?: string; classId?: string }>;
}) {
  const params = await searchParams;
  const examsPayload = await publicApi<PublicExamsResponse>("/public/exams");
  const exams = (examsPayload?.data ?? []).filter((e) => e.status === "published");

  const examId =
    params.examId && exams.some((e) => e.id === params.examId)
      ? params.examId
      : undefined;
  const classId =
    params.classId && exams.some((e) => e.classId === params.classId)
      ? params.classId
      : undefined;

  const query = new URLSearchParams();
  if (examId) query.set("examId", examId);
  if (classId) query.set("classId", classId);
  const qs = query.toString();
  const resultsPayload = await publicApi<PublicResultsResponse>(
    `/public/results${qs ? `?${qs}` : ""}`,
    { cache: "no-store" },
  );

  return (
    <ResultsClient
      key={`${resultsPayload?.examId ?? "none"}-${classId ?? "all"}`}
      exams={exams}
      rows={resultsPayload?.data ?? []}
      examId={resultsPayload?.examId ?? examId ?? null}
      classId={classId ?? null}
    />
  );
}

export default function PublicResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ examId?: string; classId?: string }>;
}) {
  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></svg>
            শ্রেণিভিত্তিক ফলাফল
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>ফলাফল</span>
            <span className="sep">›</span>
            <span className="cur">শ্রেণিভিত্তিক ফলাফল তালিকা</span>
          </nav>
        </div>
      </div>
      <main className="container page-body">
        <Suspense fallback={<ResultsLoading />}>
          <ResultsContent searchParams={searchParams} />
        </Suspense>
      </main>
    </PublicShell>
  );
}
