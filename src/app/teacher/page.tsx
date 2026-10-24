"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type Salary = Record<string, unknown>;
const api =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";
const weekDays = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি"];

function Icon({ d, size = 20 }: { d: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
  );
}
const ICON_OUT = <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>;
const ICON_SHIELD = <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>;
const ICON_FEE = <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>;
const ICON_INFO = <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></>;
function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label="বিদ্যালয়ের লোগো">
      <circle cx="48" cy="48" r="45" fill="#0F3151" />
      <circle cx="48" cy="48" r="40" fill="none" stroke="#DCEBF7" strokeWidth="1.6" />
      <path d="M48 30c-5-3.4-11-4.4-17-3.4v26c6-1 12 .1 17 3.4 5-3.3 11-4.4 17-3.4v-26c-6-1-12 0-17 3.4Z" fill="#fff" />
      <path d="M48 30v26" stroke="#21699D" strokeWidth="2" />
      <path d="M35 33.5c3.4-.5 6.6 0 9.4 1.4M35 39.5c3.4-.5 6.6 0 9.4 1.4M35 45.5c3.4-.5 6.6 0 9.4 1.4M51.6 34.9c2.8-1.4 6-1.9 9.4-1.4M51.6 40.9c2.8-1.4 6-1.9 9.4-1.4M51.6 46.9c2.8-1.4 6-1.9 9.4-1.4" stroke="#3798EA" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M48 62l3 6.2 6.8.9-5 4.7 1.3 6.7L48 77.2l-6.1 3.3 1.3-6.7-5-4.7 6.8-.9Z" fill="#1E7A46" transform="translate(0,-4) scale(0.92) translate(4.2,4)" />
    </svg>
  );
}

export default function TeacherPortalPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<Salary[]>([]);
  const [profile, setProfile] = useState<Salary | null>(null);
  const [routine, setRoutine] = useState<Salary[]>([]);
  const [error, setError] = useState("");

  async function login() {
    setError("");
    try {
    const response = await fetch(`${api}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const payload = (await response.json()) as {
      data?: { accessToken?: string };
      message?: string;
    };
    if (!response.ok || !payload.data?.accessToken) {
      setError(payload.message ?? "লগইন করা যায়নি");
      return;
    }
    setToken(payload.data.accessToken);
    const headers = { Authorization: `Bearer ${payload.data.accessToken}` };
    const [salary, profileResponse, routineResponse] = await Promise.all([
      fetch(`${api}/teacher/finance/salary`, { headers }),
      fetch(`${api}/teacher/portal/profile`, { headers }),
      fetch(`${api}/teacher/portal/routine`, { headers }),
    ]);
    const [data, profileData, routineData] = await Promise.all([
      salary.json() as Promise<{ data?: Salary[] }>,
      profileResponse.json() as Promise<{ data?: Salary }>,
      routineResponse.json() as Promise<{ data?: Salary[] }>,
    ]);
    setRows(data.data ?? []);
    setProfile(profileData.data ?? null);
    setRoutine(routineData.data ?? []);
    } catch {
      setError("লগইন বা তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।");
    }
  }

  return (
    <div className="sport">
      {!token ? (
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-logo"><Logo size={84} /></div>
            <div className="login-school">আদর্শ মডেল উচ্চ বিদ্যালয়</div>
            <div className="login-school-en">শিক্ষক প্যানেল</div>
            <div className="login-divider">শিক্ষক পোর্টাল</div>
            <div className="login-h">শিক্ষক লগইন</div>
            <p className="login-sub">ইউজারনেম ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।</p>
            <div className="field">
              <label htmlFor="teacher-identifier">ইউজারনেম <span className="req">*</span></label>
              <input
                id="teacher-identifier"
                placeholder="ইউজারনেম"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="teacher-password">পাসওয়ার্ড <span className="req">*</span></label>
              <input
                id="teacher-password"
                type="password"
                placeholder="পাসওয়ার্ড"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-lg" type="button" style={{ width: "100%", justifyContent: "center" }} onClick={() => void login()}>প্রবেশ করুন</button>
            {error && <p className="portal-error">{error}</p>}
            <div className="login-note">
              <Icon d={ICON_SHIELD} size={20} />
              শুধুমাত্র শিক্ষকদের জন্য সংরক্ষিত প্যানেল
            </div>
          </div>
        </div>
      ) : (
        <div className="shell">
          <div className="topbar">
            <div className="brand">
              <Logo size={38} />
              <div>
                <div className="bn">শিক্ষক প্যানেল</div>
                <div className="en">আদর্শ মডেল উচ্চ বিদ্যালয়</div>
              </div>
            </div>
            <div className="user">
              <button className="logout-btn" type="button" onClick={() => setToken("")}>
                <Icon d={ICON_OUT} size={17} />
                লগআউট
              </button>
            </div>
          </div>
          <div className="shell-body">
            <main className="content">
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--p600)" }}>শিক্ষক ড্যাশবোর্ড</p>
              <h2 className="page-h">বেতন ও সাপ্তাহিক রুটিন</h2>
              <p className="page-sub">আদর্শ মডেল উচ্চ বিদ্যালয়</p>
              <div className="grid2">
                <div>
                  <div className="sec-title" style={{ marginTop: 6 }}><h3>আমার প্রোফাইল</h3></div>
                  <div className="card">
                    {profile ? (
                      <dl className="dl" style={{ gridTemplateColumns: "1fr" }}>
                        <div className="row">
                          <dt>নাম</dt>
                          <dd>
                            {String(
                              (profile.user as Salary | undefined)
                                ?.displayNameBn ?? "—",
                            )}
                          </dd>
                        </div>
                        <div className="row">
                          <dt>পদবি</dt>
                          <dd>
                            {String(
                              (profile.teacher as Salary | undefined)
                                ?.designation ?? "—",
                            )}
                          </dd>
                        </div>
                        <div className="row">
                          <dt>শিক্ষক কোড</dt>
                          <dd>
                            {String(
                              (profile.teacher as Salary | undefined)
                                ?.teacherCode ?? "—",
                            )}
                          </dd>
                        </div>
                        <div className="row">
                          <dt>মোবাইল</dt>
                          <dd>
                            {String(
                              (profile.teacher as Salary | undefined)?.mobile ??
                                "—",
                            )}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p style={{ margin: 0, color: "var(--n600)" }}>প্রোফাইল পাওয়া যায়নি।</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="sec-title" style={{ marginTop: 6 }}><h3>বেতনের ইতিহাস</h3></div>
                  <div className="card" style={{ padding: "6px 20px" }}>
                    {rows.length ? (
                      <ul className="list-clean">
                        {rows.map((row, index) => (
                          <li
                            className="fee-row"
                            key={String(row.id ?? index)}
                          >
                            <span className="fi"><Icon d={ICON_FEE} /></span>
                            <div className="ft"><b>{String(row.salaryMonth ?? "—")}</b></div>
                            <div className="fa">
                              <b className="num">৳ {String(row.net ?? "—")}</b>
                              <span
                                className={`chip ${String(row.status) === "PAID"
                                  ? "chip-paid"
                                  : "chip-soon"
                                }`}
                              >
                                {String(row.status ?? "—")}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: "var(--n600)" }}>কোনো বেতন রেকর্ড নেই।</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="sec-title"><h3>সাপ্তাহিক ক্লাস রুটিন</h3></div>
              <p className="page-sub">দিন/period অনুযায়ী Admin-এর প্রকাশিত routine</p>
              <div className="tbl-wrap">
                <table className="tbl resp">
                  <thead>
                    <tr><th>দিন</th><th>ক্লাসসমূহ</th></tr>
                  </thead>
                  <tbody>
                    {weekDays.map((day, index) => (
                      <tr key={day}>
                        <td data-l="দিন"><b>{day}</b></td>
                        <td data-l="ক্লাসসমূহ" className="routine-cell">
                          {routine
                            .filter((row) => Number(row.dayOfWeek) === index)
                            .map((row) => (
                              <div key={String(row.id)}>
                                <strong>P{String(row.period)}</strong>
                                <span>{String(row.subjectNameBn ?? "বিষয়")}</span>
                              </div>
                            ))}
                          {!routine.some(
                            (row) => Number(row.dayOfWeek) === index,
                          ) && <small>রুটিন নেই</small>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {routine.length ? (
                <div className="card" style={{ padding: "6px 20px", marginTop: 20 }}>
                  <ul className="list-clean">
                    {routine.map((row, index) => (
                      <li
                        className="fee-row"
                        key={String(row.id ?? index)}
                      >
                        <div className="ft">
                          <b>
                            {String(row.subjectNameBn ?? "বিষয়")} · Period{" "}
                            {String(row.period)}
                          </b>
                          <span>
                            {String(row.classNameBn ?? "—")}{" "}
                            {row.sectionNameBn
                              ? `· ${String(row.sectionNameBn)}`
                              : ""}
                            {row.room ? ` · কক্ষ ${String(row.room)}` : ""}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="note-box">
                  <Icon d={ICON_INFO} />
                  <div>কোনো routine slot নেই।</div>
                </div>
              )}
            </main>
          </div>
          {error && <p className="portal-error" style={{ padding: "0 24px 24px" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
