import Link from "next/link";
import { publicApi } from "@/lib/api";

type Row = Record<string, string | boolean | null> & { id: string };
const titles: Record<string, string> = { news: "খবর", events: "অনুষ্ঠান", galleries: "ফটো গ্যালারি", downloads: "ডাউনলোড", importantLinks: "গুরুত্বপূর্ণ লিংক", notices: "বিজ্ঞপ্তি", pages: "তথ্য" };
export async function PublicListing({ resource, title }: { resource: string; title?: string }) {
  const payload = await publicApi<{ data: Row[] }>(`/public/content/${resource}`);
  const rows = payload?.data ?? [];
  return <main className="min-h-screen bg-neutral-50 px-4 py-10"><div className="mx-auto max-w-[1200px]"><p className="text-sm text-neutral-500"><Link href="/">হোম</Link> → {title ?? titles[resource] ?? "তথ্য"}</p><h1 className="mt-2 text-3xl font-bold text-primary-800">{title ?? titles[resource] ?? "তথ্য"}</h1><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{rows.map((row) => <article key={row.id} className="rounded-lg border border-neutral-200 bg-white p-5"><h2 className="font-bold text-primary-800">{String(row.titleBn ?? row.labelBn ?? row.name ?? row.key ?? "তথ্য")}</h2>{row.summary && <p className="mt-2 text-sm text-neutral-600">{String(row.summary)}</p>}{row.details && <p className="mt-2 text-sm text-neutral-600">{String(row.details)}</p>}{row.url && <a className="mt-3 inline-block text-primary-700 underline" href={String(row.url)}>দেখুন →</a>}{row.fileUrl && <a className="mt-3 inline-block text-primary-700 underline" href={String(row.fileUrl)}>ডাউনলোড →</a>}{resource === "notices" && <Link className="mt-3 inline-block text-primary-700" href={`/notices/${row.id}`}>বিস্তারিত →</Link>}</article>)}</div>{rows.length === 0 && <p className="mt-8 rounded-lg bg-white p-8 text-neutral-600">কোনো প্রকাশিত তথ্য নেই।</p>}</div></main>;
}
