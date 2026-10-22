import { notFound } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
export default async function NoticeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await publicApi<{
    data: Array<{
      id: string;
      titleBn: string;
      details: string;
      category: string;
    }>;
  }>("/public/content/notices");
  const notice = result?.data.find((item) => item.id === id);
  if (!notice) notFound();
  return (
    <main className="public-page">
      <article className="public-detail-card">
        <p className="public-breadcrumb">হোম › বিজ্ঞপ্তি › {notice.category}</p>
        <div className="notice-detail-label">{notice.category}</div>
        <h1>{notice.titleBn}</h1>
        <div className="notice-detail-rule" />
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(notice.details) }}
        />
        <Link href="/notices">← সব বিজ্ঞপ্তি</Link>
      </article>
    </main>
  );
}
