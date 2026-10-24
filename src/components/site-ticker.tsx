"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type TickerItem = { title: string; href: string };

export function Ticker({ items }: { items: TickerItem[] }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setFading(false);
      }, 360);
    }, 4200);
    return () => clearInterval(t);
  }, [items.length]);

  const current = items[idx] ?? { title: "সর্বশেষ বিজ্ঞপ্তি দেখুন", href: "/notices" };
  return (
    <div className="ticker" aria-label="সর্বশেষ নোটিশ">
      <div className="container">
        <div className="ticker-label">
          <svg className="icon" viewBox="0 0 24 24" width="16"><path d="m3 11 18-7-4 16-5-4-3 4v-5L3 11Z" /><path d="M12 16 21 4" /></svg>
          সর্বশেষ
        </div>
        <div className="ticker-viewport">
          <Link className={fading ? "tick-item fading" : "tick-item"} href={current.href}>{current.title}</Link>
        </div>
      </div>
    </div>
  );
}

export function AnthemBox() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={playing ? "anthem playing" : "anthem"}>
      <button type="button" aria-label={playing ? "জাতীয় সঙ্গীত থামান" : "জাতীয় সঙ্গীত বাজান"} onClick={() => setPlaying((v) => !v)}>
        <svg className="icon" viewBox="0 0 24 24">
          {playing ? <path d="M7 4h4v16H7zM13 4h4v16h-4z" /> : <path d="M7 4.5v15l13-7.5-13-7.5Z" />}
        </svg>
      </button>
      <div style={{ flex: 1 }}>
        <b>আমার সোনার বাংলা</b>
        <small>জাতীয় সঙ্গীত — বাজাতে প্লে চাপুন</small>
        <div className="bar"><i /></div>
      </div>
    </div>
  );
}
