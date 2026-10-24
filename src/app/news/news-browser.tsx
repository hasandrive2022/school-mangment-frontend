/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { bnDate } from "@/lib/bn";
import { sanitizeHtml } from "@/lib/sanitize-html";

export type NewsRow = {
  id: string;
  titleBn: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  details?: string | null;
  /** Full text (Phase-1 Part B: list rows and the single read both carry it). */
  body?: string | null;
  category?: string | null;
};

const FALLBACK_IMG = "https://placehold.co/640x360/21699D/FFFFFF?text=News";

function CalendarIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /></svg>
  );
}

export default function NewsBrowser({ rows }: { rows: NewsRow[] }) {
  const [selected, setSelected] = useState<NewsRow | null>(null);

  if (selected) {
    const bodyHtml = selected.body
      ? sanitizeHtml(selected.body)
      : selected.details
        ? sanitizeHtml(selected.details)
        : "";
    return (
      <div>
        <button className="btn btn-outline btn-sm" type="button" onClick={() => setSelected(null)} style={{ marginBottom: 18 }}>
          ‹ সব খবর
        </button>
        <article className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="detail-hero" style={{ borderRadius: 0, boxShadow: "none", margin: 0 }}>
            <img src={selected.imageUrl ?? FALLBACK_IMG} alt={selected.titleBn} />
          </div>
          <div style={{ padding: "26px 28px" }}>
            <span className="news-date">
              <CalendarIcon />
              {selected.publishedAt ? bnDate(selected.publishedAt) : ""}
              {selected.category ? ` · ${selected.category}` : ""}
            </span>
            <h2 style={{ fontSize: 23, color: "var(--p800)", margin: "8px 0 14px" }}>{selected.titleBn}</h2>
            <div className="prose">
              {bodyHtml ? (
                <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              ) : (
                selected.summary && <p>{selected.summary}</p>
              )}
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="news-grid">
      {rows.map((item) => (
        <article className="news-card" key={item.id} onClick={() => setSelected(item)}>
          <div className="im">
            <img src={item.imageUrl ?? FALLBACK_IMG} alt={item.titleBn} loading="lazy" />
          </div>
          <div className="bd">
            <span className="news-date">
              <CalendarIcon />
              {item.publishedAt ? bnDate(item.publishedAt) : ""}
            </span>
            <h3>{item.titleBn}</h3>
            {item.summary && <p>{item.summary}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}
