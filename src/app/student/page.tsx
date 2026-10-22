"use client";

import { useState } from "react";
import { usePortalSWR } from "@/lib/swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const api =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";
type Row = Record<string, unknown>;
type Payload = { data?: Row[] | Row | null; message?: string };
const tabs = [
  { id: "dashboard", label: "ড্যাশবোর্ড" },
  { id: "results", label: "আমার ফলাফল" },
  { id: "dues", label: "ফি ও বকেয়া" },
  { id: "receipts", label: "রশিদ" },
  { id: "attendance", label: "আমার হাজিরা" },
  { id: "routine", label: "রুটিন ও নোটিশ" },
  { id: "profile", label: "প্রোফাইল" },
];

export default function StudentPortalPage() {
  const [registration, setRegistration] = useState("");
  const [token, setToken] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const path =
    tab === "dues"
      ? "/student/finance/dues"
      : tab === "receipts"
        ? "/student/finance/payments"
        : tab === "profile"
          ? "/student/portal/profile"
          : tab === "attendance"
            ? "/student/portal/attendance"
            : tab === "routine"
              ? "/student/portal/routine"
              : "/results/me";
  const { data: livePayload } = usePortalSWR<Payload>(
    token ? `${api}${path}` : null,
    {
      fetcher: (url: string) =>
        fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }).then(async (response) => {
          const data = (await response.json()) as Payload;
          if (!response.ok)
            throw new Error(data.message ?? "তথ্য লোড করা যায়নি");
          return data;
        }),
    },
  );
  async function login() {
    const response = await fetch(`${api}/auth/student-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationNumber: registration }),
      cache: "no-store",
    });
    const data = (await response.json()) as {
      data?: { accessToken?: string };
      message?: string;
    };
    if (!response.ok || !data.data?.accessToken) {
      setError(data.message ?? "লগইন করা যায়নি");
      return;
    }
    setToken(data.data.accessToken);
    setError("");
    setTab("dashboard");
    setPayload(null);
  }
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  if (!token)
    return (
      <main className="student-shell">
        <section className="student-login">
          <div className="student-brand">
            <span>আ</span>
            <div>
              <b>আদর্শ মডেল উচ্চ বিদ্যালয়</b>
              <small>শিক্ষার্থী পোর্টাল</small>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>ছাত্র লগইন</CardTitle>
              <p className="portal-muted">
                শুধু রেজিস্ট্রেশন নম্বর দিয়ে প্রবেশ করুন
              </p>
            </CardHeader>
            <CardContent className="portal-form">
              <Input
                value={registration}
                onChange={(event) => setRegistration(event.target.value)}
                placeholder="রেজিস্ট্রেশন নম্বর"
                inputMode="numeric"
              />
              <Button onClick={() => void login()}>পোর্টালে প্রবেশ করুন</Button>
              {error && <p className="portal-error">{error}</p>}
            </CardContent>
          </Card>
        </section>
      </main>
    );
  return (
    <main className="student-shell">
      <div className="student-app">
        <header className="student-topbar">
          <div className="student-brand">
            <span>আ</span>
            <div>
              <b>আদর্শ মডেল উচ্চ বিদ্যালয়</b>
              <small>শিক্ষার্থী পোর্টাল</small>
            </div>
          </div>
          <Badge variant="success">সক্রিয় শিক্ষার্থী</Badge>
        </header>
        <nav className="student-tabs" aria-label="শিক্ষার্থী পোর্টাল">
          {tabs.map((item) => (
            <Button
              key={item.id}
              variant={tab === item.id ? "default" : "ghost"}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
        <section className="student-heading">
          <div>
            <p className="portal-kicker">স্বাগতম</p>
            <h1>
              {tab === "dashboard"
                ? "আমার ড্যাশবোর্ড"
                : tabs.find((item) => item.id === tab)?.label}
            </h1>
            <p className="portal-muted">রেজিস্ট্রেশন নম্বর: {registration}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setToken("");
              setPayload(null);
            }}
          >
            লগআউট
          </Button>
        </section>
        {tab === "dashboard" ? (
          <Dashboard rows={rows} registration={registration} />
        ) : (
          <RecordPanel
            tab={tab}
            rows={Array.isArray(livePayload?.data) ? livePayload.data : []}
            payload={livePayload ?? payload}
          />
        )}
      </div>
    </main>
  );
}

function Dashboard({
  rows,
  registration,
}: {
  rows: Row[];
  registration: string;
}) {
  return (
    <>
      <section className="student-stat-grid">
        <Stat label="রেজিস্ট্রেশন নম্বর" value={registration} />
        <Stat label="অ্যাকাউন্ট স্ট্যাটাস" value="সক্রিয়" />
        <Stat label="আজকের রেকর্ড" value={`${rows.length}টি`} />
      </section>
      <div className="student-columns">
        <Card>
          <CardHeader>
            <CardTitle>দ্রুত সেবা</CardTitle>
          </CardHeader>
          <CardContent className="student-quick">
            <span>ফলাফল দেখুন</span>
            <span>ফি ও রশিদ</span>
            <span>হাজিরা ক্যালেন্ডার</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>সর্বশেষ নোটিশ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="portal-muted">
              নোটিশ দেখতে রুটিন ও নোটিশ ট্যাব নির্বাচন করুন।
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
function RecordPanel({
  tab,
  rows,
  payload,
}: {
  tab: string;
  rows: Row[];
  payload: Payload | null;
}) {
  if (tab === "attendance") return <AttendancePanel rows={rows} />;
  if (tab === "results") return <ResultPanel rows={rows} />;
  if (tab === "dues" || tab === "receipts")
    return <FinancePanel tab={tab} rows={rows} />;
  if (tab === "profile") return <ProfilePanel rows={rows} />;
  if (tab === "routine") return <RoutinePanel rows={rows} payload={payload} />;
  return (
    <Card className="student-record">
      <CardHeader>
        <CardTitle>নোটিশ</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="student-record-list">
            {rows.map((row, index) => (
              <article key={String(row.id ?? index)}>
                <div>
                  <b>{String(row.titleBn ?? row.nameBn ?? "রেকর্ড")}</b>
                  <small>{String(row.details ?? row.day ?? "")}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="student-empty">
            {payload?.message ?? "কোনো নোটিশ নেই।"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function RoutinePanel({
  rows,
  payload,
}: {
  rows: Row[];
  payload: Payload | null;
}) {
  const days = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি"];
  return (
    <Card className="student-record">
      <CardHeader>
        <CardTitle>আমার ক্লাস রুটিন</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="student-routine-grid">
            {days.map((day, index) => (
              <section key={day}>
                <b>{day}</b>
                {rows
                  .filter((row) => Number(row.dayOfWeek) === index)
                  .map((row) => (
                    <article key={String(row.id)}>
                      <strong>P{String(row.period)}</strong>
                      <span>{String(row.subjectNameBn ?? "বিষয়")}</span>
                      <small>{String(row.room ?? "")}</small>
                    </article>
                  ))}
                {!rows.some((row) => Number(row.dayOfWeek) === index) && (
                  <small>কোনো ক্লাস নেই</small>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="student-empty">
            {payload?.message ?? "রুটিন Admin আপলোড করলে এখানে দেখা যাবে।"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function AttendancePanel({ rows }: { rows: Row[] }) {
  const present = rows.filter(
    (row) => String(row.status).toUpperCase() === "PRESENT",
  ).length;
  const absent = rows.length - present;
  return (
    <Card className="student-record">
      <CardHeader>
        <CardTitle>আমার হাজিরা</CardTitle>
        <p className="portal-muted">মাসভিত্তিক উপস্থিতির সারাংশ</p>
      </CardHeader>
      <CardContent>
        <div className="attendance-summary">
          <Stat label="উপস্থিত" value={`${present} দিন`} />
          <Stat label="অনুপস্থিত" value={`${absent} দিন`} />
          <Stat
            label="উপস্থিতির হার"
            value={`${rows.length ? Math.round((present / rows.length) * 100) : 0}%`}
          />
        </div>
        <div className="attendance-chart">
          <div>
            <span>উপস্থিতি</span>
            <i
              style={{
                width: `${rows.length ? (present / rows.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div>
            <span>অনুপস্থিতি</span>
            <i
              className="absent-bar"
              style={{
                width: `${rows.length ? (absent / rows.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <div className="attendance-calendar">
          {rows.map((row, index) => (
            <div
              className={
                String(row.status).toUpperCase() === "PRESENT"
                  ? "attendance-day present"
                  : "attendance-day absent"
              }
              key={String(row.id ?? row.date ?? index)}
            >
              <b>{String(row.date ?? row.attendanceDate ?? index + 1)}</b>
              <small>{String(row.status ?? "—")}</small>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
function ResultPanel({ rows }: { rows: Row[] }) {
  return (
    <Card className="student-record marksheet-paper">
      <CardHeader>
        <div className="marksheet-heading">
          <div className="marksheet-seal">আ</div>
          <div>
            <CardTitle>আদর্শ মডেল উচ্চ বিদ্যালয়</CardTitle>
            <p>একাডেমিক ফলাফল ও মার্কশিট</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            প্রিন্ট
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          rows.map((row, index) => {
            const result = (row.result ?? {}) as Row;
            const subjects = Array.isArray(row.subjects) ? row.subjects : [];
            return (
              <section
                className="marksheet-result"
                key={String(result.id ?? index)}
              >
                <div className="marksheet-meta">
                  <b>
                    {String(
                      (row.exam as Row | undefined)?.nameBn ?? "পরীক্ষার ফলাফল",
                    )}
                  </b>
                  <span>
                    মোট: {String(result.totalMarks ?? "—")} · GPA:{" "}
                    {String(result.gpa ?? "—")} ·{" "}
                    {String(result.isPassed ? "উত্তীর্ণ" : "অনুত্তীর্ণ")}
                  </span>
                </div>
                <table className="marksheet-table">
                  <thead>
                    <tr>
                      <th>বিষয়</th>
                      <th>মোট নম্বর</th>
                      <th>গ্রেড</th>
                      <th>GPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject, subjectIndex) => (
                      <tr key={String(subjectIndex)}>
                        <td>{String(subject.nameBn ?? "বিষয়")}</td>
                        <td>{String(subject.totalMarks ?? "—")}</td>
                        <td>{String(subject.letter ?? "—")}</td>
                        <td>{String(subject.gpa ?? "—")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="marksheet-remark">
                  মন্তব্য:{" "}
                  {result.isPassed
                    ? "অভিনন্দন, ফলাফল সন্তোষজনক।"
                    : "উন্নতির জন্য নিয়মিত অনুশীলন করুন।"}
                </p>
              </section>
            );
          })
        ) : (
          <div className="student-empty">প্রকাশিত ফলাফল নেই।</div>
        )}
      </CardContent>
    </Card>
  );
}
function FinancePanel({ tab, rows }: { tab: string; rows: Row[] }) {
  return (
    <Card className="student-record">
      <CardHeader>
        <CardTitle>
          {tab === "dues" ? "ফি ইভেন্ট ও বকেয়া" : "পেমেন্ট ইতিহাস ও রশিদ"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="student-record-list">
            {rows.map((row, index) => (
              <article key={String(row.id ?? index)}>
                <div>
                  <b>
                    {String(
                      row.eventNameBn ?? row.receiptNumber ?? "ফি রেকর্ড",
                    )}
                  </b>
                  <small>
                    {String(row.dueDate ?? row.paidAt ?? row.verifyCode ?? "")}
                  </small>
                </div>
                <strong>
                  ৳ {String(row.remainingAmount ?? row.amount ?? "—")}
                </strong>
                {tab === "dues" ? (
                  <Badge
                    variant={
                      String(row.status) === "PAID" ? "success" : "warning"
                    }
                  >
                    {String(row.status ?? "DUE")}
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                  >
                    রশিদ
                  </Button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="student-empty">কোনো রেকর্ড নেই।</div>
        )}
      </CardContent>
    </Card>
  );
}
function ProfilePanel({ rows }: { rows: Row[] }) {
  const row = rows[0] ?? {};
  return (
    <Card className="student-record">
      <CardHeader>
        <CardTitle>আমার প্রোফাইল</CardTitle>
      </CardHeader>
      <CardContent className="profile-grid">
        <div>
          <small>নাম</small>
          <b>{String(row.nameBn ?? "—")}</b>
        </div>
        <div>
          <small>রেজিস্ট্রেশন নম্বর</small>
          <b>{String(row.registrationNumber ?? "—")}</b>
        </div>
        <div>
          <small>শ্রেণি</small>
          <b>{String(row.classNameBn ?? "—")}</b>
        </div>
        <div>
          <small>অভিভাবকের মোবাইল</small>
          <b>{String(row.guardianMobile ?? "—")}</b>
        </div>
      </CardContent>
    </Card>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <small className="portal-muted">{label}</small>
        <strong className="student-stat-value">{value}</strong>
      </CardContent>
    </Card>
  );
}
