/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import type { PublicTeacher } from "@/lib/api";
import { toBn } from "@/lib/bn";

export default function TeachersBrowser({ teachers }: { teachers: PublicTeacher[] }) {
  const designations = useMemo(() => {
    const seen: string[] = [];
    for (const teacher of teachers) {
      const d = teacher.designationBn?.trim();
      if (d && !seen.includes(d)) seen.push(d);
    }
    return seen;
  }, [teachers]);

  const [active, setActive] = useState<string>("all");
  const visible =
    active === "all"
      ? teachers
      : teachers.filter((teacher) => teacher.designationBn?.trim() === active);

  return (
    <>
      {designations.length > 1 && (
        <div className="fchips">
          <button
            type="button"
            className={active === "all" ? "fchip on" : "fchip"}
            onClick={() => setActive("all")}
          >
            সব শিক্ষক
          </button>
          {designations.map((designation) => (
            <button
              type="button"
              key={designation}
              className={active === designation ? "fchip on" : "fchip"}
              onClick={() => setActive(designation)}
            >
              {designation}
            </button>
          ))}
        </div>
      )}
      {visible.length > 0 ? (
        <div className="person-grid c3">
          {visible.map((teacher, index) => {
            const subjLine = [teacher.subjectBn?.trim(), teacher.qualificationBn?.trim()]
              .filter(Boolean)
              .join(" · ");
            return (
              <div className="pcard" key={teacher.id}>
                {teacher.photoUrl ? (
                  <div className="ph">
                    <img src={teacher.photoUrl} alt={`${teacher.nameBn}র ছবি`} loading="lazy" />
                  </div>
                ) : (
                  <div className={`ph ph-txt${index % 2 === 1 ? " green" : ""}`}>
                    <span>{teacher.nameBn?.charAt(0) ?? "শি"}</span>
                  </div>
                )}
                <h3>{teacher.nameBn}</h3>
                {teacher.designationBn && <div className="desig">{teacher.designationBn}</div>}
                {subjLine && <div className="subj">{subjLine}</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="small muted center">এই পদবিতে কোনো শিক্ষক নেই।</p>
      )}
      <p className="small muted center" style={{ marginTop: 16 }}>
        সর্বমোট {toBn(teachers.length)} জন শিক্ষক — সম্পূর্ণ তালিকা অফিস থেকে সংগ্রহ করা যাবে।
      </p>
    </>
  );
}
