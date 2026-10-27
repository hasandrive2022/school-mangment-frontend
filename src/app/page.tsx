/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { publicHome, type HomeData } from "@/lib/api"
import { bnDay, bnMonthYear, bnDate, toBn } from "@/lib/bn";
import { categoryLabel } from "@/lib/categories";
import { getSiteUrl } from "@/lib/site-url";
import PublicShell from "@/components/site-chrome";
import { HeroSlider, MeritCarousel, QuoteBand, HomeResultPanel } from "@/components/home-widgets";
import { RevealSection } from "@/components/motion/reveal";
import { AnimatedCounter } from "@/components/motion/counter";
import { ImagePlaceholder } from "@/components/image-placeholder";

export async function generateMetadata(): Promise<Metadata> {
  const payload = await publicHome<HomeData>().catch(() => null);
  const school = payload?.data?.school;
  const name = school?.nameBn ?? "বিদ্যালয়";
  const description = school?.address
    ? `${name}, ${school.address} — নোটিশ, ফলাফল, ভর্তি, শিক্ষক ও শিক্ষার্থী পোর্টাল।`
    : `${name} — নোটিশ, ফলাফল, ভর্তি, শিক্ষক ও শিক্ষার্থী পোর্টাল।`;
  return {
    title: { absolute: name },
    description,
    alternates: { canonical: "/" },
    openGraph: { title: name, description, url: "/", type: "website" },
  };
}

const ARROW = (
  <svg className="icon" viewBox="0 0 24 24" width="15"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
);

const SVC_ICONS = [
  <path key="a" d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-4h6v4" />,
  <path key="b" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />,
  <path key="c" d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />,
  <path key="d" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M9 13h6M9 17h4" />,
  <path key="e" d="M12 9a6 6 0 1 0 0 0Zm-3.5 5-2 8 5.5-3 5.5 3-2-8" />,
  <path key="f" d="m3 11 18-7-4 16-5-4-3 4v-5L3 11ZM12 16 21 4" />,
];

const GREEN_KEYWORDS = ["তথ্য অধিকার", "অভিযোগ", "কর্মসম্পাদনা", "শুদ্ধাচার", "সেবা প্রদান", "উদ্ভাবনী", "সিটিজেন"];

export default async function HomePage() {
  const payload = await publicHome<HomeData>();
  const data = payload?.data;
  const blocks = [...(data?.blocks ?? [])].filter((b) => b.isEnabled).sort((a, b) => a.orderIndex - b.orderIndex);
  const enabled = (key: string) => blocks.some((b) => b.key === key);
  const school = data?.school;
  const notices = data?.notices ?? [];
  const news = data?.news ?? [];
  const galleries = data?.galleries ?? [];

  // JSON-LD School schema (Round 6, P4) — built from admin-controlled
  // school data only; fields are omitted when the API has no value.
  const siteUrl = getSiteUrl();
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "School",
    name: school?.nameBn ?? "বিদ্যালয়",
    url: siteUrl,
  };
  if (school?.nameEn) jsonLd.alternateName = school.nameEn;
  if (school?.address)
    jsonLd.address = { "@type": "PostalAddress", streetAddress: school.address, addressCountry: "BD" };
  if (school?.phone) jsonLd.telephone = school.phone;
  if (school?.email) jsonLd.email = school.email;
  if (school?.foundedYear) jsonLd.foundingDate = school.foundedYear;
  if (school?.logoUrl) jsonLd.logo = school.logoUrl;

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container">
        {enabled("banner") && <HeroSlider banners={data?.banners ?? []} />}

        {(enabled("notices") || enabled("news")) && (
          <RevealSection className="block" id="notice-board">
            <div className="two-col">
              <div className="card">
                <div style={{ padding: "20px 20px 0" }}>
                  <div className="sec-head" style={{ marginBottom: 6 }}>
                    <h2 className="sec-title">নোটিশ বোর্ড</h2>
                    <Link className="sec-more" href="/notices">সব দেখুন {ARROW}</Link>
                  </div>
                </div>
                <ul className="notice-list">
                  {notices.slice(0, 5).map((n) => (
                    <li className="notice-item" key={n.id}>
                      <div className="date-badge"><b>{bnDay(n.createdAt)}</b><span>{bnMonthYear(n.createdAt)}</span></div>
                      <div>
                        <h3><Link href={`/notices/${n.id}`}>{n.titleBn}</Link></h3>
                        <div className="notice-meta">
                          {n.isPinned && (
                            <span className="pin" title="পিন করা">
                              <svg className="icon" viewBox="0 0 24 24"><path d="M12 17v5M9 3h6l-1 7 3 3H7l3-3-1-7Z" /></svg>
                            </span>
                          )}
                          {n.category && <span className="chip">{categoryLabel(n.category)}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                  {notices.length === 0 && <li className="notice-item">কোনো বিজ্ঞপ্তি নেই।</li>}
                </ul>
              </div>

              <div className="card">
                <div style={{ padding: "20px 20px 0" }}>
                  <div className="sec-head" style={{ marginBottom: 6 }}>
                    <h2 className="sec-title">খবর</h2>
                    <Link className="sec-more" href="/news">সব দেখুন {ARROW}</Link>
                  </div>
                </div>
                <ul className="news-list">
                  {news.slice(0, 4).map((item) => (
                    <li className="news-item" key={item.id}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.titleBn} loading="lazy" />
                      ) : (
                        <ImagePlaceholder label={item.titleBn} />
                      )}
                      <div>
                        <h3><Link href="/news">{item.titleBn}</Link></h3>
                        {item.publishedAt && <time>{bnDate(item.publishedAt)}</time>}
                      </div>
                    </li>
                  ))}
                  {news.length === 0 && <li className="news-item">কোনো খবর নেই।</li>}
                </ul>
              </div>
            </div>
          </RevealSection>
        )}

        {enabled("messages") && (data?.messages?.length ?? 0) > 0 && (
          <RevealSection className="block">
            <div className="sec-head"><h2 className="sec-title">বাণী</h2></div>
            <div className="msg-grid">
              {data!.messages.map((m) => (
                <article className="card msg-card" key={m.personNameBn}>
                  <div className="who">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt={`${m.personNameBn} — ${m.designationBn}`} loading="lazy" />
                    ) : (
                      <div className="avatar" style={{ width: 84, height: 84, margin: 0, fontSize: 30 }}>{m.personNameBn.slice(0, 1)}</div>
                    )}
                    <div>
                      <h3>{m.personNameBn}</h3>
                      <div className="role">{m.designationBn}</div>
                    </div>
                  </div>
                  <p>{m.body}</p>
                </article>
              ))}
            </div>
          </RevealSection>
        )}

        <RevealSection className="block">
          <div className="stats-band">
            <div className="stat">
              <div className="ic"><svg className="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></svg></div>
              <div><b>{data?.stats?.students != null ? <AnimatedCounter value={data.stats.students} /> : "—"}</b><span>মোট শিক্ষার্থী</span></div>
            </div>
            <div className="stat">
              <div className="ic"><svg className="icon" viewBox="0 0 24 24"><path d="M22 10 12 5 2 10l10 5 10-5ZM6 12.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.5M22 10v6" /></svg></div>
              <div><b>{data?.stats?.teachers != null ? <AnimatedCounter value={data.stats.teachers} /> : "—"}</b><span>মোট শিক্ষক</span></div>
            </div>
            <div className="stat">
              <div className="ic"><svg className="icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15ZM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></svg></div>
              <div><b>৬ষ্ঠ–১০ম</b><span>শ্রেণিসমূহ</span></div>
            </div>
            <div className="stat">
              <div className="ic"><svg className="icon" viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-4h6v4M9 11h.01M15 11h.01M12 14h.01" /></svg></div>
              <div><b>{school?.foundedYear ? toBn(school.foundedYear) : "—"}</b><span>স্থাপিত</span></div>
            </div>
          </div>
        </RevealSection>

        {enabled("services") && (data?.services?.length ?? 0) > 0 && (
          <RevealSection className="block">
            <div className="sec-head"><h2 className="sec-title">সেবা বক্স</h2></div>
            <div className="box-grid">
              {data!.services.map((service, i) => (
                <div className={GREEN_KEYWORDS.some((k) => service.titleBn.includes(k)) ? "card svc green" : "card svc"} key={service.id}>
                  <div className="svc-head">
                    <div className="svc-ic"><svg className="icon" viewBox="0 0 24 24">{SVC_ICONS[i % SVC_ICONS.length]}</svg></div>
                    <h3>{service.titleBn}</h3>
                  </div>
                  <ul>
                    {(data?.serviceLinks ?? []).filter((l) => l.serviceBoxId === service.id).slice(0, 4).map((l) => (
                      <li key={l.id}><Link href={l.href}>{l.labelBn}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </RevealSection>
        )}

        {enabled("events") && (data?.events?.length ?? 0) > 0 && (
          <RevealSection className="block">
            <div className="sec-head">
              <h2 className="sec-title">আসন্ন ইভেন্ট</h2>
              <Link className="sec-more" href="/events">সব দেখুন {ARROW}</Link>
            </div>
            <div className="event-list">
              {data!.events.slice(0, 4).map((event) => (
                <div className="card event" key={event.id}>
                  <div className="date-badge"><b>{bnDay(event.startsAt)}</b><span>{bnMonthYear(event.startsAt).split(" ")[0]}</span></div>
                  <div>
                    <h3>{event.titleBn}</h3>
                    <p>
                      <span>
                        <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                        {bnDate(event.startsAt)}
                      </span>
                      <span>
                        <svg className="icon" viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
                        {event.venue ?? "বিদ্যালয় প্রাঙ্গণ"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>
        )}

        {enabled("merit") && (data?.meritoriousStudents?.length ?? 0) > 0 && (
          <RevealSection className="block">
            <MeritCarousel students={data!.meritoriousStudents} />
          </RevealSection>
        )}

        <RevealSection className="block" id="result-box">
          <div className="rl-grid">
            <HomeResultPanel />
          </div>
        </RevealSection>

        {enabled("gallery") && galleries.length > 0 && (
          <RevealSection className="block" id="gallery">
            <div className="sec-head">
              <h2 className="sec-title">ফটো গ্যালারি</h2>
              <Link className="sec-more" href="/gallery">সব দেখুন {ARROW}</Link>
            </div>
            <div className="gal-grid">
              {galleries.slice(0, 6).map((g) => (
                <figure className="gal" style={{ margin: 0 }} key={g.id}>
                  {g.coverUrl ? (
                    <img src={g.coverUrl} alt={g.titleBn} loading="lazy" />
                  ) : (
                    <ImagePlaceholder label={g.titleBn} />
                  )}
                  <figcaption>{g.titleBn}</figcaption>
                </figure>
              ))}
            </div>
          </RevealSection>
        )}

        {(enabled("downloads") || enabled("links")) && (
          <RevealSection className="block" id="downloads">
            <div className="two-col" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="card">
                <div style={{ padding: "20px 20px 0" }}>
                  <div className="sec-head" style={{ marginBottom: 6 }}><h2 className="sec-title">গুরুত্বপূর্ণ লিঙ্ক</h2></div>
                </div>
                <ul className="link-list">
                  {(data?.links ?? []).slice(0, 6).map((l) => (
                    <li key={l.id}>
                      <a href={l.url} target="_blank" rel="noopener">
                        <svg className="icon" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
                        {l.labelBn}
                      </a>
                    </li>
                  ))}
                  {(data?.links?.length ?? 0) === 0 && <li>কোনো লিঙ্ক নেই।</li>}
                </ul>
              </div>
              <div className="card">
                <div style={{ padding: "20px 20px 0" }}>
                  <div className="sec-head" style={{ marginBottom: 6 }}><h2 className="sec-title">ডাউনলোড</h2></div>
                </div>
                <ul className="dl-list">
                  {(data?.downloads ?? []).slice(0, 4).map((d) => (
                    <li key={d.id}>
                      <div className="dl-ic"><svg className="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6" /></svg></div>
                      <div><b>{d.titleBn}</b><small>{categoryLabel(d.category)}</small></div>
                      <a className="btn btn-outline" href={d.fileUrl}>ডাউনলোড</a>
                    </li>
                  ))}
                  {(data?.downloads?.length ?? 0) === 0 && <li>কোনো ডাউনলোড নেই।</li>}
                </ul>
              </div>
            </div>
          </RevealSection>
        )}

        {(data?.quotes?.length ?? 0) > 0 && (
          <RevealSection className="block">
            <QuoteBand quotes={data!.quotes} />
          </RevealSection>
        )}

        <RevealSection className="block">
          <div className="sec-head"><h2 className="sec-title">ভিডিও ও ম্যাপ</h2></div>
          <div className="vm-grid">
            <Link href="/video-gallery" className="video-box">
              {galleries[0]?.coverUrl ? (
                <img src={galleries[0].coverUrl} alt="বিদ্যালয়ের ভিডিও গ্যালারি" loading="lazy" />
              ) : (
                <ImagePlaceholder label="বিদ্যালয়ের ভিডিও গ্যালারি" />
              )}
              <span className="play-btn">
                <svg className="icon" viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5-13-7.5Z" /></svg>
              </span>
              <span className="video-cap"><span>আমাদের বিদ্যালয় — ভিডিও গ্যালারি</span></span>
            </Link>
            <div className="map-box">
              <iframe title="কুড়িগ্রাম সদরে বিদ্যালয়ের অবস্থান — মানচিত্র" src="https://www.openstreetmap.org/export/embed.html?bbox=89.6017%2C25.7655%2C89.6817%2C25.8455&layer=mapnik&marker=25.8055%2C89.6417" loading="lazy" />
            </div>
          </div>
        </RevealSection>
      </main>
    </PublicShell>
  );
}
