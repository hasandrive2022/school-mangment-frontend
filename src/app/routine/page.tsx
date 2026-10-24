import Link from "next/link";
import PublicShell from "@/components/site-chrome";
import {
  publicApi,
  type RoutineClassResponse,
  type RoutineExamResponse,
} from "@/lib/api";
import { RoutineTabs } from "./routine-tabs";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ক্লাস ও পরীক্ষার রুটিন",
  description: "শ্রেণি ও শাখাভিত্তিক ক্লাস রুটিন এবং পরীক্ষার রুটিন।",
  alternates: { canonical: "/routine" },
  openGraph: { title: "ক্লাস ও পরীক্ষার রুটিন", description: "শ্রেণি ও শাখাভিত্তিক ক্লাস রুটিন এবং পরীক্ষার রুটিন।", url: "/routine" },
};

export default async function RoutinePage() {
  const [classPayload, examPayload] = await Promise.all([
    publicApi<RoutineClassResponse>("/public/routine?type=class", { cache: "no-store" }),
    publicApi<RoutineExamResponse>("/public/routine?type=exam", { cache: "no-store" }),
  ]);

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
            ক্লাস ও পরীক্ষার রুটিন
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>একাডেমিক</span>
            <span className="sep">›</span>
            <span className="cur">রুটিন</span>
          </nav>
        </div>
      </div>
      <main className="container page-body">
        <RoutineTabs
          classRows={classPayload?.data ?? []}
          examRows={examPayload?.data ?? []}
        />
      </main>
    </PublicShell>
  );
}
