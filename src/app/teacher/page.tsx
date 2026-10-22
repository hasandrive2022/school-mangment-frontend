"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Salary = Record<string, unknown>;
const api =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";
const weekDays = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি"];

export default function TeacherPortalPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<Salary[]>([]);
  const [profile, setProfile] = useState<Salary | null>(null);
  const [routine, setRoutine] = useState<Salary[]>([]);
  const [error, setError] = useState("");

  async function login() {
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
  }

  return (
    <main className="teacher-shell">
      <div className="teacher-frame">
        {!token ? (
          <section className="teacher-login">
            <div className="teacher-brand">
              <span>আ</span>
              <div>
                <b>আদর্শ মডেল উচ্চ বিদ্যালয়</b>
                <small>শিক্ষক প্যানেল</small>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>শিক্ষক লগইন</CardTitle>
              </CardHeader>
              <CardContent className="teacher-form">
                <Input
                  placeholder="ইউজারনেম"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
                <Input
                  type="password"
                  placeholder="পাসওয়ার্ড"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Button onClick={() => void login()}>প্রবেশ করুন</Button>
              </CardContent>
            </Card>
          </section>
        ) : (
          <>
            <header className="teacher-topbar">
              <div className="teacher-brand">
                <span>আ</span>
                <div>
                  <b>শিক্ষক প্যানেল</b>
                  <small>আদর্শ মডেল উচ্চ বিদ্যালয়</small>
                </div>
              </div>
              <Button variant="outline" onClick={() => setToken("")}>
                লগআউট
              </Button>
            </header>
            <section className="teacher-heading">
              <p>শিক্ষক ড্যাশবোর্ড</p>
              <h1>বেতন ও সাপ্তাহিক রুটিন</h1>
            </section>
            <div className="teacher-grid">
              <Card>
                <CardHeader>
                  <CardTitle>আমার প্রোফাইল</CardTitle>
                </CardHeader>
                <CardContent className="teacher-profile">
                  {profile ? (
                    <>
                      <div>
                        <small>নাম</small>
                        <b>
                          {String(
                            (profile.user as Salary | undefined)
                              ?.displayNameBn ?? "—",
                          )}
                        </b>
                      </div>
                      <div>
                        <small>পদবি</small>
                        <b>
                          {String(
                            (profile.teacher as Salary | undefined)
                              ?.designation ?? "—",
                          )}
                        </b>
                      </div>
                      <div>
                        <small>শিক্ষক কোড</small>
                        <b>
                          {String(
                            (profile.teacher as Salary | undefined)
                              ?.teacherCode ?? "—",
                          )}
                        </b>
                      </div>
                      <div>
                        <small>মোবাইল</small>
                        <b>
                          {String(
                            (profile.teacher as Salary | undefined)?.mobile ??
                              "—",
                          )}
                        </b>
                      </div>
                    </>
                  ) : (
                    <p className="teacher-empty">প্রোফাইল পাওয়া যায়নি।</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>বেতনের ইতিহাস</CardTitle>
                </CardHeader>
                <CardContent>
                  {rows.length ? (
                    rows.map((row, index) => (
                      <div
                        className="teacher-row"
                        key={String(row.id ?? index)}
                      >
                        <span>{String(row.salaryMonth ?? "—")}</span>
                        <strong>৳ {String(row.net ?? "—")}</strong>
                        <Badge
                          variant={
                            String(row.status) === "PAID"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {String(row.status ?? "—")}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="portal-muted">কোনো বেতন রেকর্ড নেই।</p>
                  )}
                </CardContent>
              </Card>
              <Card className="teacher-routine">
                <CardHeader>
                  <CardTitle>সাপ্তাহিক ক্লাস রুটিন</CardTitle>
                  <p className="portal-muted">
                    দিন/period অনুযায়ী Admin-এর প্রকাশিত routine
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="teacher-week-grid">
                    {weekDays.map((day, index) => (
                      <div className="teacher-day" key={day}>
                        <b>{day}</b>
                        {routine
                          .filter((row) => Number(row.dayOfWeek) === index)
                          .map((row) => (
                            <small key={String(row.id)}>
                              {String(row.subjectNameBn ?? "বিষয়")} · P
                              {String(row.period)}
                            </small>
                          ))}
                        {!routine.some(
                          (row) => Number(row.dayOfWeek) === index,
                        ) && <small>রুটিন নেই</small>}
                      </div>
                    ))}
                  </div>
                  {routine.length ? (
                    <div className="teacher-assignment-list">
                      {routine.map((row, index) => (
                        <div
                          className="teacher-row"
                          key={String(row.id ?? index)}
                        >
                          <span>
                            {String(row.subjectNameBn ?? "বিষয়")} · Period{" "}
                            {String(row.period)}
                          </span>
                          <small>
                            {String(row.classNameBn ?? "—")}{" "}
                            {row.sectionNameBn
                              ? `· ${String(row.sectionNameBn)}`
                              : ""}
                            {row.room ? ` · কক্ষ ${String(row.room)}` : ""}
                          </small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="teacher-empty">কোনো routine slot নেই।</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
        {error && <p className="portal-error">{error}</p>}
      </div>
    </main>
  );
}
