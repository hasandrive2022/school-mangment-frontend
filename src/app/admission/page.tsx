import PublicShell from "@/components/site-chrome";
import { publicApi } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
import AdmissionClient from "./admission-client";

type PagesResponse = {
  data: Array<{ id: string; slug: string; titleBn: string; body: string }>;
};

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "অনলাইন ভর্তি আবেদন",
  description: "অনলাইনে ভর্তির আবেদন করুন এবং ট্র্যাকিং নম্বর দিয়ে আবেদনের অবস্থা দেখুন।",
  alternates: { canonical: "/admission" },
  openGraph: { title: "অনলাইন ভর্তি আবেদন", description: "অনলাইনে ভর্তির আবেদন করুন এবং ট্র্যাকিং নম্বর দিয়ে আবেদনের অবস্থা দেখুন।", url: "/admission" },
};

export default async function AdmissionPage() {
  const pagesPayload = await publicApi<PagesResponse>(
    "/public/content/pages",
  );
  const infoPage = pagesPayload?.data.find(
    (item) => item.slug === "admission-info",
  );
  const infoHtml = infoPage?.body ? sanitizeHtml(infoPage.body) : null;

  return (
    <PublicShell>
      <AdmissionClient infoHtml={infoHtml} />
    </PublicShell>
  );
}
