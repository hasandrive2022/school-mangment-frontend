import Link from "next/link";
import { publicApi } from "@/lib/api";
import PublicShell from "@/components/site-chrome";

type LinkRow = { id: string; labelBn: string; url: string };
type Response = { data: LinkRow[] };

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function LinksPage() {
  const payload = await publicApi<Response>("/public/content/importantLinks");
  const rows = payload?.data ?? [];

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>
            গুরুত্বপূর্ণ লিঙ্ক
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span className="cur">গুরুত্বপূর্ণ লিঙ্ক</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        {rows.length > 0 ? (
          <>
            <div className="link-grid">
              {rows.map((item, index) => (
                <a className="link-card" key={item.id} href={item.url} target="_blank" rel="noopener">
                  <span className={index % 4 === 3 ? "li green" : "li"}>
                    <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></svg>
                  </span>
                  <span>
                    <b>{item.labelBn}</b>
                    <small>{hostOf(item.url)}</small>
                  </span>
                  <span className="go">
                    <svg className="icon" viewBox="0 0 24 24" width="18"><path d="M7 17 17 7M8 7h9v9" /></svg>
                  </span>
                </a>
              ))}
            </div>
            <p className="small muted" style={{ marginTop: 16 }}>সব লিঙ্ক নতুন ট্যাবে সংশ্লিষ্ট ওয়েবসাইটে খুলবে।</p>
          </>
        ) : (
          <div className="a-empty">কোনো প্রকাশিত তথ্য নেই।</div>
        )}
      </div>
    </PublicShell>
  );
}
