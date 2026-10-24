"use client";

import { useMemo, useState } from "react";
import { categoryLabel } from "@/lib/categories";

export type DownloadRow = {
  id: string;
  titleBn: string;
  fileUrl: string;
  category: string;
};

export default function DownloadsBrowser({ rows }: { rows: DownloadRow[] }) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const row of rows) {
      if (row.category && !seen.includes(row.category)) seen.push(row.category);
    }
    return seen;
  }, [rows]);

  const [active, setActive] = useState<string>("all");
  const visible = active === "all" ? rows : rows.filter((row) => row.category === active);

  return (
    <>
      <div className="fchips">
        <button type="button" className={active === "all" ? "fchip on" : "fchip"} onClick={() => setActive("all")}>
          সব ফাইল
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={active === category ? "fchip on" : "fchip"}
            onClick={() => setActive(category)}
          >
            {categoryLabel(category)}
          </button>
        ))}
      </div>
      <div className="card a-dl-card">
        <ul className="dl-list">
          {visible.map((item) => (
            <li key={item.id}>
              <span className="dl-ic">
                <svg className="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b>{item.titleBn}</b>
                {item.category && <small>{categoryLabel(item.category)}</small>}
              </span>
              <a className="btn btn-primary btn-sm" href={item.fileUrl} target="_blank" rel="noopener">
                <svg className="icon" viewBox="0 0 24 24" width="15"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3" /></svg>
                ডাউনলোড
              </a>
            </li>
          ))}
        </ul>
        {visible.length === 0 && (
          <p className="small muted center" style={{ padding: "14px 0" }}>এই ক্যাটাগরিতে কোনো ফাইল নেই।</p>
        )}
      </div>
    </>
  );
}
