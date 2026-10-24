"use client";

import { useMemo, useState } from "react";
import type { RoutineClassRow, RoutineExamRow } from "@/lib/api";
import { bnDate, toBn } from "@/lib/bn";

/** dayOfWeek convention used across the app (student/teacher portals + seed):
 *  0 = রবিবার (Sunday) … 4 = বৃহস্পতিবার, 5 = শুক্রবার, 6 = শনিবার. */
const DAY_NAMES = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const ORDINALS = ["১ম", "২য়", "৩য়", "৪র্থ", "৫ম", "৬ষ্ঠ", "৭ম", "৮ম", "৯ম", "১০ম"];

function periodLabel(period: number): string {
  return ORDINALS[period - 1] ?? `${toBn(period)}ম`;
}

type Option = { id: string; label: string };

export function RoutineTabs({
  classRows,
  examRows,
}: {
  classRows: RoutineClassRow[];
  examRows: RoutineExamRow[];
}) {
  const [tab, setTab] = useState<"class" | "exam">("class");

  const classOptions: Option[] = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of classRows) {
      if (!seen.has(row.classId)) seen.set(row.classId, row.classNameBn ?? "শ্রেণি");
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  }, [classRows]);

  const [classId, setClassId] = useState<string>("");
  const activeClassId = classId || classOptions[0]?.id || "";

  const sectionOptions: Option[] = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of classRows) {
      if (row.classId !== activeClassId || !row.sectionId) continue;
      if (!seen.has(row.sectionId)) seen.set(row.sectionId, row.sectionNameBn ?? "শাখা");
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  }, [classRows, activeClassId]);

  const [sectionId, setSectionId] = useState<string>("all");

  const filteredClassRows = useMemo(
    () =>
      classRows.filter(
        (row) =>
          row.classId === activeClassId &&
          (sectionId === "all" || row.sectionId === sectionId),
      ),
    [classRows, activeClassId, sectionId],
  );

  const periods = useMemo(
    () => [...new Set(filteredClassRows.map((row) => row.period))].sort((a, b) => a - b),
    [filteredClassRows],
  );
  const days = useMemo(
    () => [...new Set(filteredClassRows.map((row) => row.dayOfWeek))].sort((a, b) => a - b),
    [filteredClassRows],
  );

  const activeClassLabel = classOptions.find((o) => o.id === activeClassId)?.label;
  const activeSectionLabel =
    sectionId === "all" ? null : sectionOptions.find((o) => o.id === sectionId)?.label;

  const examClassOptions: Option[] = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of examRows) {
      if (row.classId && !seen.has(row.classId)) {
        seen.set(row.classId, row.classNameBn ?? "শ্রেণি");
      }
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  }, [examRows]);
  const examNameOptions = useMemo(
    () => [...new Set(examRows.map((row) => row.nameBn))],
    [examRows],
  );
  const [examName, setExamName] = useState<string>("all");
  const [examClassId, setExamClassId] = useState<string>("all");
  const filteredExamRows = useMemo(
    () =>
      examRows.filter(
        (row) =>
          (examName === "all" || row.nameBn === examName) &&
          (examClassId === "all" || row.classId === examClassId),
      ),
    [examRows, examName, examClassId],
  );

  return (
    <>
      <div className="tabs" role="tablist">
        <button
          className={`tab-btn${tab === "class" ? " on" : ""}`}
          type="button"
          role="tab"
          aria-selected={tab === "class"}
          onClick={() => setTab("class")}
        >
          ক্লাস রুটিন
        </button>
        <button
          className={`tab-btn${tab === "exam" ? " on" : ""}`}
          type="button"
          role="tab"
          aria-selected={tab === "exam"}
          onClick={() => setTab("exam")}
        >
          পরীক্ষার রুটিন
        </button>
      </div>

      <div className={`tab-pane${tab === "class" ? " on" : ""}`}>
        {classRows.length > 0 ? (
          <>
            <div className="card filter-card">
              <form className="filter-grid f3" onSubmit={(e) => e.preventDefault()}>
                <div className="field">
                  <label htmlFor="rtClass">শ্রেণি</label>
                  <select
                    id="rtClass"
                    value={activeClassId}
                    onChange={(e) => {
                      setClassId(e.target.value);
                      setSectionId("all");
                    }}
                  >
                    {classOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="rtSection">শাখা</label>
                  <select
                    id="rtSection"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                  >
                    <option value="all">সব শাখা</option>
                    {sectionOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary" type="submit">রুটিন দেখুন</button>
              </form>
            </div>
            {activeClassLabel && (
              <p className="small muted" style={{ margin: "0 0 10px" }}>
                <b>
                  {activeClassLabel} শ্রেণি
                  {activeSectionLabel ? `, ${activeSectionLabel} শাখা` : ""}
                </b>
              </p>
            )}
            {filteredClassRows.length > 0 ? (
              <div className="tbl-wrap">
                <table className="data routine">
                  <thead>
                    <tr>
                      <th>বার / পিরিয়ড</th>
                      {periods.map((period) => (
                        <th key={period}>{periodLabel(period)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day) => (
                      <tr key={day}>
                        <td>{DAY_NAMES[day] ?? `দিন ${toBn(day)}`}</td>
                        {periods.map((period) => {
                          const entries = filteredClassRows.filter(
                            (row) => row.dayOfWeek === day && row.period === period,
                          );
                          return (
                            <td key={period}>
                              {entries.map((entry) => (
                                <div key={entry.id}>
                                  {entry.subjectNameBn ?? "—"}
                                  {entry.teacherNameBn && <small>{entry.teacherNameBn}</small>}
                                  {entry.room && <small>{entry.room}</small>}
                                </div>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="small muted center">
                নির্বাচিত শ্রেণি/শাখার জন্য কোনো রুটিন এন্ট্রি পাওয়া যায়নি।
              </p>
            )}
          </>
        ) : (
          <div className="tbl-wrap">
            <table className="data routine">
              <tbody>
                <tr>
                  <td style={{ textAlign: "center" }}>
                    ক্লাস রুটিন এখনো অনলাইনে প্রকাশিত হয়নি। রুটিনের জন্য বিদ্যালয় অফিসে যোগাযোগ করুন।
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`tab-pane${tab === "exam" ? " on" : ""}`}>
        {examRows.length > 0 ? (
          <>
            <div className="card filter-card">
              <form className="filter-grid f3" onSubmit={(e) => e.preventDefault()}>
                <div className="field">
                  <label htmlFor="rtExam">পরীক্ষা</label>
                  <select
                    id="rtExam"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                  >
                    <option value="all">সব পরীক্ষা</option>
                    {examNameOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="rtExamClass">শ্রেণি</label>
                  <select
                    id="rtExamClass"
                    value={examClassId}
                    onChange={(e) => setExamClassId(e.target.value)}
                  >
                    <option value="all">সব শ্রেণি</option>
                    {examClassOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary" type="submit">রুটিন দেখুন</button>
              </form>
            </div>
            <div className="tbl-wrap">
              <table className="data ct">
                <thead>
                  <tr>
                    <th>পরীক্ষা</th>
                    <th>শ্রেণি</th>
                    <th>শুরু</th>
                    <th>শেষ</th>
                    <th>বিষয়সমূহ</th>
                    <th>অবস্থা</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExamRows.map((row) => (
                    <tr key={row.examId}>
                      <td data-label="পরীক্ষা"><b>{row.nameBn}</b></td>
                      <td data-label="শ্রেণি">{row.classNameBn ?? "—"}</td>
                      <td data-label="শুরু">{row.startsAt ? bnDate(row.startsAt) : "—"}</td>
                      <td data-label="শেষ">{row.endsAt ? bnDate(row.endsAt) : "—"}</td>
                      <td data-label="বিষয়সমূহ">
                        {row.subjects.length > 0 ? row.subjects.join(", ") : "—"}
                      </td>
                      <td data-label="অবস্থা">
                        {row.isPublished ? (
                          <span className="chip chip-green">প্রকাশিত</span>
                        ) : (
                          <span className="chip">নির্ধারিত</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredExamRows.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "var(--ink2)" }}>
                        নির্বাচিত ফিল্টারে কোনো পরীক্ষা পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="tbl-wrap">
            <table className="data ct">
              <tbody>
                <tr>
                  <td style={{ textAlign: "center" }}>
                    পরীক্ষার রুটিন এখনো অনলাইনে প্রকাশিত হয়নি। রুটিনের জন্য বিদ্যালয় অফিসে যোগাযোগ করুন।
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
