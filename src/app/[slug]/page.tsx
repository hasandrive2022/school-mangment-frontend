import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicApi } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
type PageResponse = {
  data: Array<{
    id: string;
    slug: string;
    titleBn: string;
    titleEn: string | null;
    body: string;
    excerpt: string | null;
  }>;
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const payload = await publicApi<PageResponse>("/public/content/pages");
  const page = payload?.data.find((item) => item.slug === slug);
  if (!page) return { title: "পৃষ্ঠা পাওয়া যায়নি" };
  const description =
    page.excerpt ?? page.body.replace(/<[^>]+>/g, " ").slice(0, 155);
  return {
    title: page.titleBn,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.titleBn, description, type: "article" },
  };
}
export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const payload = await publicApi<PageResponse>("/public/content/pages");
  const page = payload?.data.find((item) => item.slug === slug);
  if (!page) notFound();
  return (
    <main className="public-page">
      <div className="public-page-inner">
        <p className="public-breadcrumb">হোম › তথ্য</p>
        <article className="public-detail-card">
          <p className="public-kicker">{page.titleEn ?? "বিদ্যালয়ের তথ্য"}</p>
          <h1>{page.titleBn}</h1>
          {page.excerpt && (
            <p className="public-detail-excerpt">{page.excerpt}</p>
          )}
          <div className="notice-detail-rule" />
          <div
            className="rich-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }}
          />
        </article>
      </div>
    </main>
  );
}
