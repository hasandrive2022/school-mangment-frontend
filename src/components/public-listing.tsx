import Link from "next/link";
import { publicApi } from "@/lib/api";

type Row = Record<string, string | boolean | null> & { id: string };
const titles: Record<string, string> = { news: "খবর", events: "অনুষ্ঠান", galleries: "ফটো গ্যালারি", downloads: "ডাউনলোড", importantLinks: "গুরুত্বপূর্ণ লিংক", notices: "বিজ্ঞপ্তি", pages: "তথ্য" };
export async function PublicListing({ resource, title }: { resource: string; title?: string }) {
  const payload = await publicApi<{ data: Row[] }>(`/public/content/${resource}`);
  const rows = payload?.data ?? [];
  return <main className="public-page"><div className="public-page-inner"><p className="public-breadcrumb"><Link href="/">হোম</Link> <span>›</span> {title ?? titles[resource] ?? "তথ্য"}</p><div className="public-title-row"><div><p className="public-kicker">আদর্শ মডেল উচ্চ বিদ্যালয়</p><h1 className="public-page-title">{title ?? titles[resource] ?? "তথ্য"}</h1></div><span className="public-count">{rows.length}টি তথ্য</span></div><div className="public-card-grid">{rows.map((row) => <article key={row.id} className="public-card"><div className="public-card-top"><span className="public-card-icon">{resource === "downloads" ? "↓" : resource === "events" ? "◷" : resource === "galleries" ? "▧" : "▤"}</span>{row.category && <small>{String(row.category)}</small>}</div><h2>{String(row.titleBn ?? row.labelBn ?? row.name ?? row.key ?? "তথ্য")}</h2>{row.summary && <p>{String(row.summary)}</p>}{row.details && <p>{String(row.details)}</p>}{row.url && <a href={String(row.url)}>দেখুন →</a>}{row.fileUrl && <a href={String(row.fileUrl)}>ডাউনলোড →</a>}{resource === "notices" && <Link href={`/notices/${row.id}`}>বিস্তারিত →</Link>}</article>)}</div>{rows.length === 0 && <p className="public-empty">কোনো প্রকাশিত তথ্য নেই।</p>}</div></main>;
}
