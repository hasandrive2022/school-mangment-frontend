"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toBn } from "@/lib/bn";
import { ImagePlaceholder } from "@/components/image-placeholder";

type Banner = { imageUrl: string | null; titleBn: string; captionBn: string | null };

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const slides: Banner[] = banners.length
    ? banners
    : [{ imageUrl: null, titleBn: "আদর্শ মডেল উচ্চ বিদ্যালয়", captionBn: "মানসম্মত শিক্ষা বিস্তারে অঙ্গীকারবদ্ধ একটি ঐতিহ্যবাহী শিক্ষাপ্রতিষ্ঠান।" }];
  const [cur, setCur] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => setCur((i + slides.length) % slides.length), [slides.length]);
  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setCur((c) => (c + 1) % slides.length), 5000);
  }, [slides.length]);

  useEffect(() => {
    restart();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [restart]);

  return (
    <div className="slider-wrap">
      <div className="slider" onMouseEnter={() => { if (timer.current) clearInterval(timer.current); }} onMouseLeave={restart}>
        {slides.map((b, i) => (
          <figure key={i} className={i === cur ? "slide on" : "slide"} style={{ margin: 0 }}>
            {b.imageUrl ? (
              <img src={b.imageUrl} alt={b.titleBn} loading={i === 0 ? undefined : "lazy"} />
            ) : (
              <ImagePlaceholder label={b.titleBn} />
            )}
            <figcaption>
              <h3>{b.titleBn}</h3>
              {b.captionBn && <p>{b.captionBn}</p>}
            </figcaption>
          </figure>
        ))}
        {slides.length > 1 && (
          <>
            <button className="slider-btn prev" aria-label="আগের ছবি" onClick={() => { go(cur - 1); restart(); }}>
              <svg className="icon" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button className="slider-btn next" aria-label="পরের ছবি" onClick={() => { go(cur + 1); restart(); }}>
              <svg className="icon" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
            </button>
            <div className="slider-dots">
              {slides.map((_, i) => (
                <button key={i} aria-label={`স্লাইড ${toBn(i + 1)}`} className={i === cur ? "on" : undefined} onClick={() => { go(i); restart(); }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type MeritStudent = {
  id: string;
  nameBn: string;
  registrationNumber: string | null;
  photoUrl?: string | null;
  totalMarks?: number | null;
  gpa?: string | null;
};

export function MeritCarousel({ students }: { students: MeritStudent[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [winW, setWinW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1280));

  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const visible = winW <= 640 ? 1 : winW <= 1024 ? 2 : 4;
  const max = Math.max(0, students.length - visible);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !track.children[0]) return;
    const clamped = Math.min(idx, max);
    const stepW = (track.children[0] as HTMLElement).getBoundingClientRect().width + 20;
    track.style.transform = `translateX(${-clamped * stepW}px)`;
  }, [idx, max]);

  const avatarClass = ["avatar", "avatar g", "avatar n", "avatar l"];
  return (
    <>
      <div className="sec-head">
        <h2 className="sec-title">কৃতি শিক্ষার্থী</h2>
        <div className="merit-nav">
          <button aria-label="আগের শিক্ষার্থী" disabled={idx <= 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            <svg className="icon" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button aria-label="পরের শিক্ষার্থী" disabled={idx >= max} onClick={() => setIdx((i) => Math.min(max, i + 1))}>
            <svg className="icon" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
      <div className="merit-wrap">
        <div className="merit-viewport">
          <div className="merit-track" ref={trackRef}>
            {students.map((s, i) => (
              <div className="card merit-card" key={s.id}>
                {s.photoUrl ? (
                  <img className="avatar" src={s.photoUrl} alt={s.nameBn} loading="lazy" />
                ) : (
                  <div className={avatarClass[i % avatarClass.length]}>{s.nameBn.slice(0, 1)}</div>
                )}
                <h3>{s.nameBn}</h3>
                <div className="cls">
                  {s.totalMarks != null && <>মোট নম্বর {toBn(s.totalMarks)}</>}
                </div>
                {s.gpa != null && <span className="gpa">GPA {toBn(s.gpa)}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

type Quote = { textBn: string; authorBn: string | null };

export function QuoteBand({ quotes }: { quotes: Quote[] }) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (quotes.length < 2) return;
    const t = setInterval(() => setCur((c) => (c + 1) % quotes.length), 6000);
    return () => clearInterval(t);
  }, [quotes.length]);
  if (!quotes.length) return null;
  return (
    <div className="quote-band">
      {quotes.map((q, i) => (
        <div key={i} className={i === cur ? "quote-slide on" : "quote-slide"}>
          <blockquote>{q.textBn}</blockquote>
          {q.authorBn && <cite>— {q.authorBn}</cite>}
        </div>
      ))}
      {quotes.length > 1 && (
        <div className="quote-dots">
          {quotes.map((_, i) => (
            <button key={i} aria-label={`উক্তি ${toBn(i + 1)}`} className={i === cur ? "on" : undefined} onClick={() => setCur(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HomeResultPanel() {
  const router = useRouter();
  const [reg, setReg] = useState("");
  return (
    <div className="card panel">
      <h3 className="panel-title">
        <svg className="icon" viewBox="0 0 24 24" style={{ color: "var(--p600)" }}><circle cx="12" cy="9" r="6" /><path d="m8.5 14-2 8 5.5-3 5.5 3-2-8" /></svg>
        পাবলিক রেজাল্ট অনুসন্ধান
      </h3>
      <p className="panel-sub">রেজিস্ট্রেশন নম্বর দিয়ে ফলাফল দেখুন — লগিন ছাড়াই।</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = reg.trim();
          router.push(v ? `/result-search?registrationNumber=${encodeURIComponent(v)}` : "/result-search");
        }}
      >
        <div className="form-grid">
          <div className="field form-full">
            <label htmlFor="homeReg">রেজিস্ট্রেশন নম্বর <i>*</i></label>
            <input id="homeReg" type="text" inputMode="numeric" placeholder="যেমন: 26100023" value={reg} onChange={(e) => setReg(e.target.value)} />
          </div>
          <div className="form-full">
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              ফলাফল খুঁজুন
            </button>
          </div>
        </div>
      </form>
      <p className="hint">
        <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
        <span>শ্রেণিভিত্তিক সম্পূর্ণ ফলাফল দেখতে ফলাফল পেজে যান।</span>
      </p>
    </div>
  );
}

export function PortalLoginTabs() {
  const router = useRouter();
  const [tab, setTab] = useState<"teacher" | "student">("teacher");
  const [studentReg, setStudentReg] = useState("");
  return (
    <div className="card panel">
      <h3 className="panel-title">
        <svg className="icon" viewBox="0 0 24 24" style={{ color: "var(--p600)" }}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        পোর্টাল লগিন
      </h3>
      <p className="panel-sub">শিক্ষক ও শিক্ষার্থীরা নিজ নিজ পোর্টালে প্রবেশ করুন।</p>
      <div className="tabs" role="tablist">
        <button type="button" className={tab === "teacher" ? "on" : undefined} role="tab" onClick={() => setTab("teacher")}>শিক্ষক লগিন</button>
        <button type="button" className={tab === "student" ? "on" : undefined} role="tab" onClick={() => setTab("student")}>ছাত্র লগিন</button>
      </div>
      {tab === "teacher" ? (
        <div className="tab-pane on">
          <div className="stack">
            <p className="hint" style={{ margin: 0 }}>
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
              <span>শিক্ষক পোর্টালে আইডি ও পাসওয়ার্ড দিয়ে লগিন করুন। পাসওয়ার্ড ভুলে গেলে বিদ্যালয় অফিসে যোগাযোগ করুন — Admin পাসওয়ার্ড রিসেট করে দেবেন।</span>
            </p>
            <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={() => router.push("/teacher")}>শিক্ষক পোর্টালে যান</button>
          </div>
        </div>
      ) : (
        <div className="tab-pane on">
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/student");
            }}
          >
            <div className="field">
              <label htmlFor="homeStudentReg">রেজিস্ট্রেশন নম্বর <i>*</i></label>
              <input id="homeStudentReg" type="text" inputMode="numeric" placeholder="যেমন: 26100023" value={studentReg} onChange={(e) => setStudentReg(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-green" style={{ width: "100%" }}>প্রবেশ করুন</button>
          </form>
          <p className="hint">
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
            <span>শিক্ষার্থীদের কোনো পাসওয়ার্ড লাগে না — ভর্তির সময় পাওয়া রেজিস্ট্রেশন নম্বর দিয়েই ফলাফল, হাজিরা ও ফির হিসাব দেখা যায়।</span>
          </p>
        </div>
      )}
    </div>
  );
}
