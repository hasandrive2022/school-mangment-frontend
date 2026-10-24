import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { publicHome, type HomeData } from "@/lib/api";
import { toBn } from "@/lib/bn";
import { SiteNav, type NavItem } from "./site-nav";
import { Ticker, AnthemBox, type TickerItem } from "./site-ticker";

type School = NonNullable<HomeData["data"]["school"]>;
type Home = HomeData["data"];

const FALLBACK_LINKS = [
  { labelBn: "শিক্ষা মন্ত্রণালয়", url: "https://moedu.gov.bd" },
  { labelBn: "মাউশি (DSHE)", url: "https://dshe.gov.bd" },
  { labelBn: "দিনাজপুর শিক্ষা বোর্ড", url: "https://dinajpureducationboard.gov.bd" },
  { labelBn: "NCTB", url: "https://nctb.gov.bd" },
  { labelBn: "জাতীয় তথ্য বাতায়ন", url: "https://bangladesh.gov.bd" },
];

function LogoSvg() {
  return (
    <svg className="logo" viewBox="0 0 96 96" role="img" aria-label="বিদ্যালয়ের লোগো">
      <circle cx="48" cy="48" r="45" fill="#0F3151" />
      <circle cx="48" cy="48" r="40" fill="none" stroke="#DCEBF7" strokeWidth="1.6" />
      <path d="M48 30c-5-3.4-11-4.4-17-3.4v26c6-1 12 .1 17 3.4 5-3.3 11-4.4 17-3.4v-26c-6-1-12 0-17 3.4Z" fill="#fff" />
      <path d="M48 30v26" stroke="#21699D" strokeWidth="2" />
      <path d="M35 33.5c3.4-.5 6.6 0 9.4 1.4M35 39.5c3.4-.5 6.6 0 9.4 1.4M35 45.5c3.4-.5 6.6 0 9.4 1.4M51.6 34.9c2.8-1.4 6-1.9 9.4-1.4M51.6 40.9c2.8-1.4 6-1.9 9.4-1.4M51.6 46.9c2.8-1.4 6-1.9 9.4-1.4" stroke="#3798EA" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M48 62l3 6.2 6.8.9-5 4.7 1.3 6.7L48 77.2l-6.1 3.3 1.3-6.7-5-4.7 6.8-.9Z" fill="#1E7A46" transform="translate(0,-4) scale(0.92) translate(4.2,4)" />
    </svg>
  );
}

export function TopBar({ school }: { school?: School }) {
  return (
    <div className="topbar">
      <div className="container">
        <div className="tb-left">
          <span>
            <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v5" /></svg>
            EIIN: {school?.eiin ? toBn(school.eiin) : "—"}
          </span>
          <span>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
            স্থাপিত: {school?.foundedYear ? `${toBn(school.foundedYear)} খ্রিস্টাব্দ` : "—"}
          </span>
        </div>
        <div className="tb-right">
          {school?.phone && (
            <a className="hide-m" href={`tel:${school.phone}`}>
              <svg className="icon" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z" /></svg>
              {toBn(school.phone)}
            </a>
          )}
          {school?.email && (
            <a className="hide-m" href={`mailto:${school.email}`}>
              <svg className="icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
              {school.email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({ school }: { school?: School }) {
  return (
    <header className="site-header">
      <div className="container">
        <div className="brand">
          {school?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="logo" src={school.logoUrl} alt="বিদ্যালয়ের লোগো" />
          ) : (
            <LogoSvg />
          )}
          <div>
            <h1>{school?.nameBn ?? "আদর্শ মডেল উচ্চ বিদ্যালয়"}</h1>
            <div className="en">{(school?.nameEn ?? "Adarsha Model High School").toUpperCase()}</div>
            <div className="motto">শিক্ষাই আলো, শিক্ষাই শক্তি</div>
          </div>
        </div>
        <div className="gov-badge" aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#1E7A46" /><circle cx="24" cy="24" r="10.5" fill="#C62828" /><path d="M24 5.5v4M24 38.5v4M5.5 24h4M38.5 24h4M11 11l2.8 2.8M34.2 34.2 37 37M37 11l-2.8 2.8M13.8 34.2 11 37" stroke="#F2C230" strokeWidth="2.2" strokeLinecap="round" /></svg>
          <div className="gb-text">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার<small>মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর</small></div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ school, links }: { school?: School; links?: Home["links"] }) {
  const footLinks = links && links.length > 0 ? links.slice(0, 6) : FALLBACK_LINKS;
  return (
    <footer id="footer-contact">
      <div className="container">
        <div className="foot-grid">
          <div>
            <h4>যোগাযোগ</h4>
            <ul className="foot-contact">
              <li>
                <svg className="icon" viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
                <span>{school?.nameBn ?? "আদর্শ মডেল উচ্চ বিদ্যালয়"}<br />{school?.address ?? ""}</span>
              </li>
              {school?.phone && (
                <li>
                  <svg className="icon" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z" /></svg>
                  <span>{toBn(school.phone)}</span>
                </li>
              )}
              {school?.email && (
                <li>
                  <svg className="icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
                  <span>{school.email}</span>
                </li>
              )}
              <li>
                <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v5" /></svg>
                <span>EIIN: {school?.eiin ? toBn(school.eiin) : "—"}{school?.foundedYear ? ` · স্থাপিত: ${toBn(school.foundedYear)}` : ""}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4>গুরুত্বপূর্ণ লিঙ্ক</h4>
            <ul>
              {footLinks.map((l) => (
                <li key={l.labelBn + l.url}><a href={l.url} target="_blank" rel="noopener">{l.labelBn}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>সেবাসমূহ</h4>
            <ul>
              <li><Link href="/admission">অনলাইন ভর্তি আবেদন</Link></li>
              <li><Link href="/result-search">ফলাফল অনুসন্ধান</Link></li>
              <li><Link href="/receipt-verify">রশিদ যাচাই</Link></li>
              <li><Link href="/notices">নোটিশ বোর্ড</Link></li>
              <li><Link href="/compliance">অনলাইনে অভিযোগ দাখিল</Link></li>
              <li><Link href="/downloads">ডাউনলোড</Link></li>
            </ul>
          </div>
          <div>
            <h4>জাতীয় সঙ্গীত ও হটলাইন</h4>
            <AnthemBox />
            <div className="hotlines">
              <div className="hotline"><b>৩৩৩</b><span>সরকারি তথ্য সেবা</span></div>
              <div className="hotline"><b>৯৯৯</b><span>জাতীয় জরুরি সেবা</span></div>
              <div className="hotline"><b>১০২</b><span>ফায়ার সার্ভিস</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="foot-bottom">
        <div className="container">
          <span>© {toBn(2026)} {school?.nameBn ?? "আদর্শ মডেল উচ্চ বিদ্যালয়"} — সর্বস্বত্ব সংরক্ষিত।</span>
          <span>কারিগরি সহায়তায়: <a href="#">স্কুল ম্যানেজমেন্ট সিস্টেম</a></span>
        </div>
      </div>
    </footer>
  );
}

/**
 * Public-site shell: design chrome (topbar / header / nav / ticker / footer)
 * around every public page. Data comes from the home payload.
 */
async function PublicShellContent({ children }: { children: ReactNode }) {
  const payload = await publicHome<HomeData>();
  const data = payload?.data;
  const blocks = data?.blocks ?? [];
  const blockEnabled = (key: string) => {
    const b = blocks.find((x) => x.key === key);
    return b ? b.isEnabled : true;
  };
  const navItems: NavItem[] = [...(data?.menuItems ?? [])]
    .filter((i) => i.isVisible)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((i) => ({ label: i.labelBn, href: i.href }));
  const tickerItems: TickerItem[] = (data?.notices ?? []).slice(0, 5).map((n) => ({
    title: n.titleBn,
    href: `/notices/${n.id}`,
  }));

  return (
    <div className="dsite">
      <TopBar school={data?.school} />
      <SiteHeader school={data?.school} />
      {blockEnabled("menu") && <SiteNav items={navItems} />}
      {blockEnabled("ticker") && <Ticker items={tickerItems} />}
      {children}
      <SiteFooter school={data?.school} links={data?.links} />
    </div>
  );
}

/**
 * Streaming fallback chrome (Round 6, P5): skeleton bars ONLY — it must
 * never render misleading fallback values (EIIN "—", a fallback school
 * name in an <h1>, or a single-item "হোম" nav) that then get replaced
 * when the real settings arrive. It also keeps exactly one <h1> in the
 * streamed document: the real header's.
 */
function PublicShellLoading({ children }: { children: ReactNode }) {
  return (
    <div className="dsite" aria-busy="true">
      <div className="topbar" aria-hidden="true">
        <div className="container">
          <span className="chrome-sk chrome-sk-sm" />
          <span className="chrome-sk chrome-sk-sm" />
        </div>
      </div>
      <div className="site-header" aria-hidden="true">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="chrome-sk chrome-sk-logo" />
            <span>
              <span className="chrome-sk chrome-sk-title" />
              <span className="chrome-sk chrome-sk-sub" />
            </span>
          </div>
        </div>
      </div>
      <nav className="navbar" aria-hidden="true">
        <div className="container" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span className="chrome-sk chrome-sk-nav" key={i} />
          ))}
        </div>
      </nav>
      {children}
      <footer aria-hidden="true">
        <div className="container" style={{ display: "flex", gap: 10, padding: "18px 0" }}>
          <span className="chrome-sk chrome-sk-title" />
          <span className="chrome-sk chrome-sk-sub" />
        </div>
      </footer>
    </div>
  );
}

export default function PublicShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PublicShellLoading>{children}</PublicShellLoading>}>
      <PublicShellContent>{children}</PublicShellContent>
    </Suspense>
  );
}
