import Link from "next/link";
import { publicApi } from "@/lib/api";
import PublicShell from "@/components/site-chrome";
import NewsBrowser, { type NewsRow } from "./news-browser";

type Response = { data: NewsRow[] };

export default async function NewsPage() {
  const payload = await publicApi<Response>("/public/content/news");
  const rows = payload?.data ?? [];

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M4 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9" /><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" /></svg>
            বিদ্যালয়ের খবর
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span className="cur">খবর</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {rows.length > 0 ? <NewsBrowser rows={rows} /> : <div className="a-empty">কোনো প্রকাশিত তথ্য নেই।</div>}
      </div>
    </PublicShell>
  );
}
