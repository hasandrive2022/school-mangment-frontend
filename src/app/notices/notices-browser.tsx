"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { bnDay, bnMonthYear } from "@/lib/bn";

export type NoticeRow = {
  id: string;
  titleBn: string;
  category: string;
  details: string;
  isPinned: boolean;
  createdAt: string;
};

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function NoticesBrowser({ rows }: { rows: NoticeRow[] }) {
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
          সব নোটিশ
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={active === category ? "fchip on" : "fchip"}
            onClick={() => setActive(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="notice-list">
        {visible.map((item) => (
          <Link href={`/notices/${item.id}`} key={item.id} className="nitem">
            <div className="date-badge">
              <b>{bnDay(item.createdAt)}</b>
              <span>{bnMonthYear(item.createdAt)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3>
                {item.isPinned && (
                  <span className="pin">
                    <svg className="icon" viewBox="0 0 24 24"><path d="M12 17v5M9 3h6l-1 7 3 3H7l3-3-1-7Z" /></svg>
                  </span>
                )}{" "}
                {item.titleBn}
              </h3>
              {item.details && <p>{stripTags(item.details)}</p>}
              <div className="nmeta">
                {item.category && <span className="chip">{item.category}</span>}
                {item.isPinned && <span className="chip chip-red">পিন করা</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="small muted center" style={{ marginTop: 14 }}>এই ক্যাটাগরিতে কোনো নোটিশ নেই।</p>
      )}
    </>
  );
}
