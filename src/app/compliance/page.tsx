import Link from "next/link";
import { publicApi } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
import PublicShell from "@/components/site-chrome";
import ComplianceForm from "./compliance-form";

type PagesResponse = {
  data: Array<{ id: string; slug: string; titleBn: string; body: string }>;
};

type Section = {
  key: string;
  anchor: string;
  chipLabel: string;
  title: string;
  match: (slug: string) => boolean;
};

const SECTIONS: Section[] = [
  {
    key: "rti",
    anchor: "rti",
    chipLabel: "তথ্য অধিকার",
    title: "তথ্য অধিকার (RTI)",
    match: (slug) => slug.includes("rti") || slug === "compliance",
  },
  {
    key: "charter",
    anchor: "charter",
    chipLabel: "সেবা প্রদান প্রতিশ্রুতি (সিটিজেন চার্টার)",
    title: "সেবা প্রদান প্রতিশ্রুতি (সিটিজেন চার্টার)",
    match: (slug) => slug.includes("charter") || slug.includes("citizen"),
  },
  {
    key: "apa",
    anchor: "apa",
    chipLabel: "বার্ষিক কর্মসম্পাদনা (APA)",
    title: "বার্ষিক কর্মসম্পাদনা চুক্তি (APA)",
    match: (slug) => slug.includes("apa"),
  },
  {
    key: "nis",
    anchor: "nis",
    chipLabel: "শুদ্ধাচার কৌশল (NIS)",
    title: "জাতীয় শুদ্ধাচার কৌশল (NIS)",
    match: (slug) => slug.includes("nis"),
  },
  {
    key: "grs",
    anchor: "grs",
    chipLabel: "অভিযোগ প্রতিকার (GRS)",
    title: "অভিযোগ প্রতিকার ব্যবস্থাপনা (GRS)",
    match: (slug) => slug.includes("grs"),
  },
];

export default async function CompliancePage() {
  const payload = await publicApi<PagesResponse>("/public/content/pages");
  const pages = payload?.data ?? [];
  const used = new Set<string>();
  const resolved = SECTIONS.map((section) => {
    const page = pages.find((item) => !used.has(item.id) && section.match(item.slug));
    if (page) used.add(page.id);
    return { section, page };
  });

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5M12 21a9 9 0 0 0 0-18" /></svg>
            তথ্য অধিকার ও অনলাইন অভিযোগ
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span>কমপ্লায়েন্স</span>
            <span className="sep">›</span>
            <span className="cur">তথ্য অধিকার</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        <div className="fchips">
          {resolved.map(({ section }, index) => (
            <a key={section.key} className={index === 0 ? "fchip on" : "fchip"} href={`#${section.anchor}`}>
              {section.chipLabel}
            </a>
          ))}
        </div>
        <div className="two-col">
          <div>
            {resolved.map(({ section, page }, index) => (
              <article
                key={section.key}
                id={section.anchor}
                className="card prose a-anchor"
                style={{ padding: "24px 26px", marginBottom: index < resolved.length - 1 ? 22 : 0 }}
              >
                <h3 style={{ marginTop: 0 }}>{page?.titleBn ?? section.title}</h3>
                {page?.body ? (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }} />
                ) : (
                  <p className="muted" style={{ marginBottom: 0 }}>এই বিভাগের তথ্য এখনো প্রকাশিত হয়নি।</p>
                )}
              </article>
            ))}
          </div>
          <aside>
            <div className="card side-box">
              <h3>
                <svg className="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>
                কমপ্লায়েন্স ডকুমেন্ট
              </h3>
              <ul className="side-list">
                <li><Link href="/downloads">সিটিজেন চার্টার (PDF)</Link></li>
                <li><Link href="/downloads">APA কর্ম-পরিকল্পনা</Link></li>
                <li><Link href="/downloads">শুদ্ধাচার কর্মপরিকল্পনা</Link></li>
                <li><Link href="/downloads">তথ্য আবেদন ফরম</Link></li>
                <li><Link href="/downloads">GRS নীতিমালা</Link></li>
              </ul>
            </div>
            <div className="card side-box" style={{ marginTop: 18 }}>
              <h3>
                <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                সেবার সময়সীমা
              </h3>
              <ul className="side-list">
                <li><a href="#rti">তথ্যের আবেদন নিষ্পত্তি — ২০ কর্মদিবস</a></li>
                <li><a href="#grs">অভিযোগ নিষ্পত্তি — ১৫ কর্মদিবস</a></li>
                <li><a href="#charter">সনদপত্র প্রদান — ৩ কর্মদিবস</a></li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="sec-head"><h2 className="sec-title">অনলাইনে অভিযোগ দাখিল করুন</h2></div>
        <ComplianceForm />
      </div>
    </PublicShell>
  );
}
