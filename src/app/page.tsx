import Image from "next/image";
import Link from "next/link";
import { publicApi, type HomeData } from "@/lib/api";

export default async function HomePage() {
  const payload = await publicApi<HomeData>("/public/content/home");
  const data = payload?.data;
  const blocks = [...(data?.blocks ?? [])]
    .filter((block) => block.isEnabled)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const enabled = (key: string) => blocks.some((block) => block.key === key);
  const school = data?.school;
  return (
    <div className="site-home">
      <div className="home-topbar">
        <div className="home-container">
          <span>বাংলাদেশের একটি শিক্ষা প্রতিষ্ঠান</span>
          <span>
            EIIN: {school?.eiin ?? "—"} · প্রতিষ্ঠিত:{" "}
            {school?.foundedYear ?? "—"}{" "}
            <Link href="/login" className="admin-pill">
              Admin লগইন
            </Link>
          </span>
        </div>
      </div>
      <header className="home-header">
        <div className="home-container brand-row">
          <div className="brand-mark">
            {school?.logoUrl ? (
              <Image
                src={school.logoUrl}
                alt="লোগো"
                width={64}
                height={64}
                unoptimized
              />
            ) : (
              "আ"
            )}
          </div>
          <div>
            <h1>{school?.nameBn ?? "আদর্শ মডেল উচ্চ বিদ্যালয়"}</h1>
            <p>{school?.nameEn ?? "Adarsha Model High School"}</p>
            <strong>শিক্ষাই জাতির মেরুদণ্ড</strong>
          </div>
          <div className="gov-card">
            গণপ্রজাতন্ত্রী বাংলাদেশ<small>শিক্ষা মন্ত্রণালয়</small>
          </div>
        </div>
      </header>
      {enabled("menu") && (
        <nav className="home-nav">
          <div className="home-container nav-links">
            <Link href="/">হোম</Link>
            {(data?.menuItems ?? [])
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((item) => (
                <Link href={item.href} key={item.id}>
                  {item.labelBn}
                </Link>
              ))}
          </div>
        </nav>
      )}
      {enabled("ticker") && (
        <div className="ticker">
          <div className="home-container ticker-row">
            <b>সর্বশেষ</b>
            <Link
              href={
                data?.notices?.[0]
                  ? `/notices/${data.notices[0].id}`
                  : "/notices"
              }
            >
              {data?.notices?.[0]?.titleBn ?? "সর্বশেষ বিজ্ঞপ্তি দেখুন"}
            </Link>
          </div>
        </div>
      )}
      <main className="home-container">
        {enabled("banner") && (
          <section className="hero-slider">
            {data?.banners?.[0] ? (
              <>
                <Image
                  src={data.banners[0].imageUrl}
                  alt={data.banners[0].titleBn}
                  width={1200}
                  height={420}
                  unoptimized
                />
                <div>
                  <h2>{data.banners[0].titleBn}</h2>
                  <p>{data.banners[0].captionBn}</p>
                </div>
              </>
            ) : (
              <div className="empty-home">ব্যানার শীঘ্রই প্রকাশিত হবে</div>
            )}
          </section>
        )}
        {enabled("about") && (
          <section className="home-block about-grid">
            <div>
              <SectionTitle title="আমাদের বিদ্যালয়" href="/about" />
              <p>
                {data?.pages?.find((page) => page.slug === "about")?.body ??
                  "বিদ্যালয়ের পরিচিতি শীঘ্রই প্রকাশিত হবে।"}
              </p>
              <Link href="/about" className="more-link">
                বিস্তারিত পড়ুন →
              </Link>
            </div>
            <div className="stats-band">
              <Stat
                value={data?.stats?.students?.toLocaleString("bn-BD") ?? "—"}
                label="মোট শিক্ষার্থী"
              />
              <Stat
                value={data?.stats?.teachers?.toLocaleString("bn-BD") ?? "—"}
                label="মোট শিক্ষক"
              />
              <Stat value={school?.foundedYear ?? "—"} label="প্রতিষ্ঠার বছর" />
              <Stat value={school?.eiin ?? "—"} label="EIIN" />
            </div>
          </section>
        )}
        {enabled("services") && (
          <section className="home-block">
            <SectionTitle title="গুরুত্বপূর্ণ সেবা" />
            <div className="service-grid">
              {(data?.services ?? []).map((service) => (
                <article className="home-card service-card" key={service.id}>
                  <div className="service-icon">✦</div>
                  <h3>{service.titleBn}</h3>
                  {(data?.serviceLinks ?? [])
                    .filter((link) => link.serviceBoxId === service.id)
                    .slice(0, 4)
                    .map((link) => (
                      <Link href={link.href} key={link.id}>
                        › {link.labelBn}
                      </Link>
                    ))}
                </article>
              ))}
            </div>
          </section>
        )}
        {enabled("messages") && (
          <section className="home-block">
            <SectionTitle title="প্রধানের বাণী" />
            <div className="message-grid">
              {(data?.messages ?? []).map((message) => (
                <article
                  className="home-card message-card"
                  key={message.personNameBn}
                >
                  {message.photoUrl ? (
                    <Image
                      src={message.photoUrl}
                      alt=""
                      width={80}
                      height={80}
                      unoptimized
                    />
                  ) : (
                    <div className="avatar">
                      {message.personNameBn.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <h3>{message.personNameBn}</h3>
                    <strong>{message.designationBn}</strong>
                    <p>{message.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {enabled("merit") && (
          <section className="home-block">
            <SectionTitle title="মেধাবী শিক্ষার্থী" href="/students" />
            <div className="person-grid">
              {(data?.meritoriousStudents ?? []).map((student, index) => (
                <article className="home-card person-card" key={student.id}>
                  <span className="rank-badge">{index + 1}</span>
                  <div>
                    <h3>{student.nameBn}</h3>
                    <p>রেজিস্ট্রেশন: {student.registrationNumber ?? "—"}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {enabled("teachers") && (
          <section className="home-block">
            <SectionTitle title="আমাদের শিক্ষকবৃন্দ" href="/teachers" />
            <div className="person-grid">
              {(data?.teachers ?? []).map((teacher) => (
                <article className="home-card person-card" key={teacher.id}>
                  <div className="avatar">{teacher.nameBn.slice(0, 1)}</div>
                  <div>
                    <h3>{teacher.nameBn}</h3>
                    <p>{teacher.username ?? "শিক্ষক"}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {(enabled("notices") || enabled("news")) && (
          <section className="home-block two-col">
            <div className="home-card">
              <SectionTitle title="বিজ্ঞপ্তি" href="/notices" />
              {(data?.notices ?? []).slice(0, 5).map((notice) => (
                <Link
                  className="notice-row"
                  href={`/notices/${notice.id}`}
                  key={notice.id}
                >
                  <span className="date-badge">
                    {new Date(notice.createdAt).getDate()}
                    <small>তারিখ</small>
                  </span>
                  <span>
                    <b>{notice.titleBn}</b>
                    <em>
                      {notice.category}
                      {notice.isPinned ? " · পিন" : ""}
                    </em>
                  </span>
                </Link>
              ))}
            </div>
            <div className="home-card">
              <SectionTitle title="সাম্প্রতিক খবর" href="/news" />
              {(data?.news ?? []).slice(0, 4).map((item) => (
                <Link className="news-row" href="/news" key={item.id}>
                  <b>{item.titleBn}</b>
                  <small>{item.summary}</small>
                </Link>
              ))}
            </div>
          </section>
        )}
        {(enabled("events") || enabled("gallery")) && (
          <section className="home-block two-col">
            <div>
              <SectionTitle title="আসন্ন অনুষ্ঠান" href="/events" />
              {(data?.events ?? []).slice(0, 4).map((event) => (
                <article className="home-card event-row" key={event.id}>
                  <span className="date-badge">
                    {new Date(event.startsAt).getDate()}
                    <small>তারিখ</small>
                  </span>
                  <div>
                    <b>{event.titleBn}</b>
                    <p>{event.venue ?? "বিদ্যালয় প্রাঙ্গণ"}</p>
                  </div>
                </article>
              ))}
            </div>
            <div>
              <SectionTitle title="ফটো গ্যালারি" href="/gallery" />
              <div className="gallery-grid">
                {(data?.galleries ?? []).slice(0, 3).map((gallery) => (
                  <Link href="/gallery" key={gallery.id}>
                    <Image
                      src={
                        gallery.coverUrl ??
                        "https://placehold.co/400x260/21699D/FFFFFF?text=School"
                      }
                      alt={gallery.titleBn}
                      width={400}
                      height={260}
                      unoptimized
                    />
                    <span>{gallery.titleBn}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
        {(enabled("downloads") || enabled("links")) && (
          <section className="home-block two-col">
            <div className="home-card">
              <SectionTitle title="ডাউনলোড" href="/downloads" />
              {(data?.downloads ?? []).slice(0, 5).map((item) => (
                <Link
                  className="download-row"
                  href={item.fileUrl}
                  key={item.id}
                >
                  ▣ <span>{item.titleBn}</span>↓
                </Link>
              ))}
            </div>
            <div className="home-card">
              <SectionTitle title="গুরুত্বপূর্ণ লিংক" href="/links" />
              {(data?.links ?? []).slice(0, 5).map((item) => (
                <Link className="download-row" href={item.url} key={item.id}>
                  ↗ <span>{item.labelBn}</span>→
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="home-footer">
        <div className="home-container footer-grid">
          <div>
            <h2>{school?.nameBn ?? "আদর্শ মডেল উচ্চ বিদ্যালয়"}</h2>
            <p>{school?.address ?? "—"}</p>
          </div>
          <div>
            <h3>দ্রুত লিংক</h3>
            <Link href="/about">আমাদের বিদ্যালয়</Link>
            <Link href="/contact">যোগাযোগ</Link>
          </div>
          <div>
            <h3>ঠিকানা</h3>
            <p>{school?.address ?? "—"}</p>
          </div>
        </div>
        <div className="home-container copyright">
          © {new Date().getFullYear()}{" "}
          {school?.nameBn ?? "আদর্শ মডেল উচ্চ বিদ্যালয়"} — সর্বস্বত্ব সংরক্ষিত
        </div>
      </footer>
    </div>
  );
}
function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="home-section-title">
      <h2>{title}</h2>
      {href && <Link href={href}>সব দেখুন →</Link>}
    </div>
  );
}
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}
