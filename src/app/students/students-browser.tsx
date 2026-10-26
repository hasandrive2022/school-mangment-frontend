"use client";

import { useMemo, useState } from "react";
import type { PublicStudent, PublicStudentsResponse } from "@/lib/api";
import { toBn } from "@/lib/bn";

type Counts = PublicStudentsResponse["counts"];

export default function StudentsBrowser({
  students,
  counts,
}: {
  students: PublicStudent[];
  counts: Counts;
}) {
  const [classId, setClassId] = useState<string>("all");
  const [query, setQuery] = useState("");

  const classOptions = useMemo(
    () => counts.filter((c) => c.classId && c.classBn),
    [counts],
  );

  const visible = useMemo(() => {
    const q = query.trim();
    return students.filter((student) => {
      if (classId !== "all" && student.classId !== classId) return false;
      if (q && !student.nameBn.includes(q)) return false;
      return true;
    });
  }, [students, classId, query]);

  return (
    <>
      <div className="card filter-card">
        <form className="filter-grid f3" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="sfClass">শ্রেণি</label>
            <select
              id="sfClass"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="all">সব শ্রেণি</option>
              {classOptions.map((c) => (
                <option key={c.classId} value={c.classId ?? ""}>
                  {c.classBn}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sfSearch">নাম দিয়ে খুঁজুন</label>
            <input
              id="sfSearch"
              type="text"
              placeholder="শিক্ষার্থীর নাম লিখুন"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            খুঁজুন
          </button>
        </form>
      </div>
      <div className="tbl-wrap">
        <table className="data ct">
          <thead>
            <tr>
              <th>নাম</th>
              <th>রোল</th>
              <th>শ্রেণি</th>
              <th>শাখা</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((student) => (
              <tr key={student.id}>
                <td className="cell-main" data-label="নাম">
                  <div className="cell-person">
                    <span className="avatar av-txt">{student.nameBn?.charAt(0) ?? "শি"}</span>
                    <b>{student.nameBn}</b>
                  </div>
                </td>
                <td data-label="রোল" className="num">
                  {student.roll != null ? toBn(student.roll) : "—"}
                </td>
                <td data-label="শ্রেণি">{student.classBn ?? "—"}</td>
                <td data-label="শাখা">{student.sectionBn ?? "—"}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--ink2)" }}>
                  কোনো শিক্ষার্থী পাওয়া যায়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>
        মোট {toBn(visible.length)} জন শিক্ষার্থী দেখানো হচ্ছে।
      </p>
    </>
  );
}
