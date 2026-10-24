"use client";

import { useEffect, useState } from "react";
import { toBn } from "@/lib/bn";

type Remaining = { d: number; h: number; m: number; s: number };

function remaining(target: number): Remaining | null {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

function pad(value: number): string {
  return toBn(String(value).padStart(2, "0"));
}

/**
 * Upcoming-result countdown (round-1 design, result-search page): shown for
 * the nearest scheduled exam from GET /public/exams. Ticks client-side and
 * disappears once the publish moment passes.
 */
export function ResultCountdown({
  examName,
  publishAt,
}: {
  examName: string;
  publishAt: string;
}) {
  const target = new Date(publishAt).getTime();
  const [left, setLeft] = useState<Remaining | null>(() =>
    Number.isNaN(target) ? null : remaining(target),
  );

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const timer = setInterval(() => setLeft(remaining(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (Number.isNaN(target) || left === null) return null;

  const publishLabel = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(publishAt));

  return (
    <div className="card center" style={{ maxWidth: 860, margin: "26px auto 0", padding: 26 }}>
      <span className="chip chip-amber" style={{ fontSize: 13, padding: "6px 14px" }}>
        আসন্ন ফলাফল
      </span>
      <h3 style={{ fontSize: 20, color: "var(--p800)", marginTop: 12 }}>
        {examName}-এর ফলাফল প্রকাশের বাকি
      </h3>
      <p className="muted" style={{ margin: "4px 0 0" }}>
        প্রকাশের তারিখ: <b>{publishLabel}</b> — ফলাফল প্রকাশের পর এই পেজ থেকেই দেখা যাবে।
      </p>
      <div className="countdown">
        <div className="cd-box"><b>{toBn(left.d)}</b><span>দিন</span></div>
        <div className="cd-box"><b>{pad(left.h)}</b><span>ঘণ্টা</span></div>
        <div className="cd-box"><b>{pad(left.m)}</b><span>মিনিট</span></div>
        <div className="cd-box"><b>{pad(left.s)}</b><span>সেকেন্ড</span></div>
      </div>
    </div>
  );
}
