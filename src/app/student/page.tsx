"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePortalSWR } from "@/lib/swr";
import { bnDate, bnMonthYear, toBn } from "@/lib/bn";

const api =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";

type Row = Record<string, unknown>;
type ListPayload = { data?: Row[] | null; message?: string };
type ProfileData = {
  student?: Row;
  user?: Row;
  classNameBn?: unknown;
  sectionNameBn?: unknown;
  sectionShift?: unknown;
  sectionGroupName?: unknown;
  sessionName?: unknown;
} | null;
type ProfilePayload = { data?: ProfileData; message?: string };
type ProfileInfo = NonNullable<ProfileData>;

const tabs = [
  { id: "dashboard", label: "ড্যাশবোর্ড", short: "ড্যাশবোর্ড" },
  { id: "results", label: "আমার ফলাফল", short: "ফলাফল" },
  { id: "fees", label: "আমার ফি ও রশিদ", short: "ফি ও রশিদ" },
  { id: "attendance", label: "আমার হাজিরা", short: "হাজিরা" },
  { id: "routine", label: "রুটিন ও নোটিশ", short: "নোটিশ" },
  { id: "profile", label: "আমার প্রোফাইল", short: "প্রোফাইল" },
] as const;
type TabId = (typeof tabs)[number]["id"];

const DAY_NAMES = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];
/** BD week order for the routine grid + attendance calendar (Saturday first). */
const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];
const DAY_SHORT = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];

const s = (v: unknown, fb = "—"): string =>
  v === null || v === undefined || v === "" ? fb : String(v);
const n = (v: unknown): number => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
const has = (v: unknown): boolean =>
  v !== null && v !== undefined && v !== "";
/** Backend money is paisa — display as taka (same convention as the admin). */
const taka = (paisa: unknown): string =>
  `৳${toBn(
    (n(paisa) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 }),
  )}`;
const todayStr = (): string => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};
const ordinalBn = (pos: number): string => {
  const map: Record<number, string> = {
    1: "১ম",
    2: "২য়",
    3: "৩য়",
    4: "৪র্থ",
    5: "৫ম",
    6: "৬ষ্ঠ",
    7: "৭ম",
    8: "৮ম",
    9: "৯ম",
    10: "১০ম",
  };
  return map[pos] ?? `${toBn(pos)}তম`;
};

/* ---- Bengali amount-in-words (presentation of the API amount only) ---- */
const BN_WORDS = [
  "শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়",
  "দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ",
  "বিশ", "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটাশ", "ঊনত্রিশ",
  "ত্রিশ", "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ",
  "চল্লিশ", "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ",
  "পঞ্চাশ", "একান্ন", "বাহান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট",
  "ষাট", "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর",
  "সত্তর", "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি",
  "আশি", "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "আটাশি", "ঊননব্বই",
  "নব্বই", "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই",
];
function wordsBn(x: number): string {
  if (x === 0) return "শূন্য";
  const parts: string[] = [];
  const crore = Math.floor(x / 10000000);
  if (crore) {
    parts.push(`${wordsBn(crore)} কোটি`);
    x %= 10000000;
  }
  const lakh = Math.floor(x / 100000);
  if (lakh) {
    parts.push(`${BN_WORDS[lakh]} লক্ষ`);
    x %= 100000;
  }
  const hazar = Math.floor(x / 1000);
  if (hazar) {
    parts.push(`${BN_WORDS[hazar]} হাজার`);
    x %= 1000;
  }
  const shoto = Math.floor(x / 100);
  if (shoto) {
    parts.push(`${BN_WORDS[shoto]} শত`);
    x %= 100;
  }
  if (x) parts.push(BN_WORDS[x]!);
  return parts.join(" ");
}
const takaInWords = (paisa: unknown): string =>
  `${wordsBn(Math.round(n(paisa) / 100))} টাকা মাত্র`;

/* ---------------- icons / logo (unchanged design assets) ---------------- */
function Icon({ d, size = 20 }: { d: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
  );
}
const ICONS: Record<string, ReactNode> = {
  dashboard: <><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 22v-8h6v8" /></>,
  results: <><circle cx="12" cy="9" r="6" /><path d="m8.5 14-2 8 5.5-3 5.5 3-2-8" /></>,
  fees: <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>,
  attendance: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" /></>,
  routine: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  profile: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  out: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
  print: <><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></>,
  back: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
  pin: <><path d="M12 17v5" /><path d="M9 3h6l-1 7 3 3H7l3-7z" /></>,
};
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

/* ---------------- shared helpers ---------------- */
function useAuthSWR<T>(token: string, path: string | null) {
  return usePortalSWR<T>(token && path ? `${api}${path}` : null, {
    fetcher: (url: string) =>
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }).then(async (response) => {
        const data = (await response
          .json()
          .catch(() => null)) as (T & { message?: string }) | null;
        if (!response.ok)
          throw new Error(data?.message ?? "তথ্য লোড করা যায়নি");
        return data as T;
      }),
  });
}
const list = (payload: ListPayload | undefined): Row[] =>
  Array.isArray(payload?.data) ? payload.data : [];

function dueStatus(row: Row): { label: string; cls: string } {
  const status = String(row.status ?? "DUE").toUpperCase();
  if (status === "PAID") return { label: "পরিশোধিত", cls: "chip-paid" };
  if (status === "PARTIAL") return { label: "আংশিক", cls: "chip-partial" };
  if (has(row.dueDate) && String(row.dueDate) > todayStr())
    return { label: "আসন্ন", cls: "chip-soon" };
  return { label: "বকেয়া", cls: "chip-due" };
}
const remainingOf = (row: Row): number =>
  has(row.remainingAmount)
    ? n(row.remainingAmount)
    : Math.max(n(row.amount) - n(row.paidAmount), 0);

const CATEGORY_LABELS: Record<string, string> = {
  general: "সাধারণ",
  admission: "ভর্তি",
  fee: "ফি",
  exam: "পরীক্ষা",
  holiday: "ছুটি",
  result: "ফলাফল",
  urgent: "জরুরি",
};
const METHOD_LABELS: Record<string, string> = {
  CASH: "নগদ (অফিস)",
  cash: "নগদ (অফিস)",
  BKASH: "বিকাশ",
  NAGAD: "নগদ (মোবাইল)",
  BANK: "ব্যাংক",
};

function NoticeRow({ row }: { row: Row }) {
  const dateIso = s(row.publishAt ?? row.createdAt, "");
  const d = dateIso ? new Date(dateIso) : null;
  const valid = d && !Number.isNaN(d.getTime());
  return (
    <div className="notice-row">
      {row.isPinned ? (
        <span className="pin"><Icon d={ICONS.pin} size={16} /></span>
      ) : null}
      <div className="date-badge">
        <b>{valid ? toBn(d.getDate()) : "—"}</b>
        <span>
          {valid
            ? new Intl.DateTimeFormat("bn-BD", { month: "long" }).format(d)
            : ""}
        </span>
      </div>
      <div className="nt">
        <b>{s(row.titleBn, "নোটিশ")}</b>
        {has(row.details) && (
          <div style={{ fontSize: 13.5, color: "var(--n600)" }}>
            {String(row.details)}
          </div>
        )}
        <div className="chips">
          <span className="chip chip-cat">
            {CATEGORY_LABELS[String(row.category ?? "")] ??
              s(row.category, "সাধারণ")}
          </span>
          {has(row.audienceClass) ? (
            <span className="chip chip-target">
              শুধু {String(row.audienceClass)}
            </span>
          ) : (
            <span className="chip chip-cat">সবাই</span>
          )}
          {has(row.attachmentUrl) && (
            <a
              className="chip chip-cat"
              href={String(row.attachmentUrl)}
              target="_blank"
              rel="noreferrer"
            >
              সংযুক্তি দেখুন
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="note-box">
      <Icon d={ICONS.info} />
      <div>{children}</div>
    </div>
  );
}

/* ---------------- main page ---------------- */
export default function StudentPortalPage() {
  const [registration, setRegistration] = useState("");
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<TabId>("dashboard");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const { data: profilePayload } = useAuthSWR<ProfilePayload>(
    token,
    "/student/portal/profile",
  );
  const { data: duesPayload } = useAuthSWR<ListPayload>(
    token,
    "/student/finance/dues",
  );
  const { data: paymentsPayload } = useAuthSWR<ListPayload>(
    token,
    "/student/finance/payments",
  );
  const { data: resultsPayload } = useAuthSWR<ListPayload>(
    token,
    "/results/me",
  );
  const { data: attendancePayload } = useAuthSWR<ListPayload>(
    token,
    "/student/portal/attendance",
  );
  const { data: routinePayload } = useAuthSWR<ListPayload>(
    token,
    "/student/portal/routine",
  );
  const { data: noticesPayload } = useAuthSWR<ListPayload>(
    token,
    "/student/portal/notices",
  );
  const { data: upcomingPayload } = useAuthSWR<ListPayload>(
    token,
    "/student/portal/upcoming-results",
  );

  const profile = profilePayload?.data ?? null;
  const student: Row = profile?.student ?? {};
  const user: Row = profile?.user ?? {};
  const dues = list(duesPayload);
  const payments = list(paymentsPayload);
  const results = list(resultsPayload);
  const attendanceAll = list(attendancePayload);
  const routineRows = list(routinePayload);
  const notices = list(noticesPayload);
  const upcoming = list(upcomingPayload);

  const name = s(user.displayNameBn, "শিক্ষার্থী");
  const regNo = s(user.registrationNumber, registration);
  const unpaidCount = dues.filter(
    (row) => String(row.status).toUpperCase() !== "PAID",
  ).length;

  async function login() {
    if (!registration.trim() || loggingIn) return;
    setLoggingIn(true);
    try {
      const response = await fetch(`${api}/auth/student-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: registration.trim() }),
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
    } finally {
      setLoggingIn(false);
    }
  }

  if (!token)
    return (
      <div className="sport">
        <div className="login-wrap">
          <form
            className="login-card"
            onSubmit={(event) => {
              event.preventDefault();
              void login();
            }}
          >
            <div className="login-logo"><Logo size={84} /></div>
            <div className="login-school">আদর্শ মডেল উচ্চ বিদ্যালয়</div>
            <div className="login-school-en">
              ADARSH MODEL HIGH SCHOOL · EIIN: 123456
            </div>
            <div className="login-divider">ছাত্র পোর্টাল</div>
            <div className="login-h">ছাত্র লগইন</div>
            <p className="login-sub">
              স্বাগতম! তোমার ফলাফল, ফি, হাজিরা ও প্রোফাইল দেখতে রেজিস্ট্রেশন
              নম্বর দিয়ে প্রবেশ করো।
            </p>
            <div className="field">
              <label htmlFor="student-reg">
                রেজিস্ট্রেশন নম্বর <span className="req">*</span>
              </label>
              <input
                id="student-reg"
                value={registration}
                onChange={(event) => setRegistration(event.target.value)}
                placeholder="রেজিস্ট্রেশন নম্বর"
                inputMode="numeric"
                autoComplete="off"
              />
              <div className="hint">
                রেজিস্ট্রেশন নম্বরটি স্কুল থেকে দেওয়া হয়েছে — ভর্তির রশিদে
                পাবে।
              </div>
            </div>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loggingIn}
            >
              প্রবেশ করুন
            </button>
            {error && <p className="portal-error">{error}</p>}
            <div className="login-note">
              <Icon d={ICONS.shield} size={20} />
              পাসওয়ার্ড লাগবে না — শুধু রেজিস্ট্রেশন নম্বর দিন
            </div>
            <div className="login-foot">
              রেজিস্ট্রেশন নম্বর ভুলে গেলে স্কুল অফিসে যোগাযোগ করো।
              অভিভাবকরাও একই নম্বর দিয়ে দেখতে পারবেন।
            </div>
          </form>
        </div>
      </div>
    );

  const profileInfo: ProfileInfo = profile ?? {};
  const classLine = [
    has(profileInfo.classNameBn) ? String(profileInfo.classNameBn) : null,
    has(profileInfo.sectionNameBn) ? String(profileInfo.sectionNameBn) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="sport">
      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <Logo size={38} />
            <div>
              <div className="bn">আদর্শ মডেল উচ্চ বিদ্যালয়</div>
              <div className="en">ছাত্র পোর্টাল</div>
            </div>
          </div>
          <div className="user">
            <div className="who">
              <b>{name}</b>
              <span>রেজি: {toBn(regNo)}</span>
            </div>
            {has(student.photoUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="avatar"
                src={String(student.photoUrl)}
                alt={name}
              />
            ) : (
              <span className="avatar-txt">{name.slice(0, 1)}</span>
            )}
            <button
              className="logout-btn"
              type="button"
              onClick={() => setToken("")}
            >
              <Icon d={ICONS.out} size={17} />
              লগআউট
            </button>
          </div>
        </div>
        <div className="shell-body">
          <aside className="sidebar">
            <div className="stu-mini">
              {has(student.photoUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={String(student.photoUrl)} alt={name} />
              ) : (
                <span className="avatar-txt">{name.slice(0, 1)}</span>
              )}
              <div>
                <b>{name}</b>
                {classLine && <span>{classLine}</span>}
                <span>রেজি: {toBn(regNo)}</span>
              </div>
            </div>
            <nav className="snav" aria-label="শিক্ষার্থী পোর্টাল">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tab === item.id ? "active" : undefined}
                  onClick={() => setTab(item.id)}
                >
                  <Icon d={ICONS[item.id]} />
                  {item.label}
                  {item.id === "fees" && unpaidCount > 0 && (
                    <span className="nbadge">{toBn(unpaidCount)}</span>
                  )}
                  {item.id === "routine" && notices.length > 0 && (
                    <span className="nbadge">{toBn(notices.length)}</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>
          <main className="content">
            {tab === "dashboard" && (
              <Dashboard
                name={name}
                regNo={regNo}
                profile={profile ?? {}}
                student={student}
                dues={dues}
                results={results}
                attendanceAll={attendanceAll}
                notices={notices}
                upcoming={upcoming}
                go={setTab}
              />
            )}
            {tab === "results" && (
              <>
                <h2 className="page-h">আমার ফলাফল</h2>
                <p className="page-sub">
                  প্রকাশিত সব পরীক্ষার ফলাফল — যেকোনো পরীক্ষার বিস্তারিত
                  মার্কশিট দেখতে &quot;বিস্তারিত&quot; চাপুন।
                </p>
                <ResultsPanel
                  results={results}
                  upcoming={upcoming}
                  profile={profile ?? {}}
                  student={student}
                  name={name}
                  regNo={regNo}
                />
              </>
            )}
            {tab === "fees" && (
              <>
                <h2 className="page-h">আমার ফি ও রশিদ</h2>
                <p className="page-sub">
                  সব ফি ইভেন্ট, পরিশোধের অবস্থা ও রশিদ — বকেয়া থাকলে স্কুল
                  অফিসে গিয়ে পরিশোধ করুন।
                </p>
                <FeesPanel
                  dues={dues}
                  payments={payments}
                  profile={profile ?? {}}
                  student={student}
                  name={name}
                  regNo={regNo}
                />
              </>
            )}
            {tab === "attendance" && (
              <>
                <h2 className="page-h">আমার হাজিরা</h2>
                <p className="page-sub">
                  মাসভিত্তিক উপস্থিতির ক্যালেন্ডার — শ্রেণি শিক্ষক প্রতিদিন
                  হাজিরা নথিভুক্ত করেন।
                </p>
                <AttendancePanel token={token} allRows={attendanceAll} />
              </>
            )}
            {tab === "routine" && (
              <>
                <h2 className="page-h">রুটিন ও নোটিশ</h2>
                <p className="page-sub">
                  {has(profileInfo.classNameBn)
                    ? `${String(profileInfo.classNameBn)}-এর ক্লাস রুটিন ও তোমার জন্য প্রযোজ্য নোটিশ।`
                    : "তোমার ক্লাস রুটিন ও তোমার জন্য প্রযোজ্য নোটিশ।"}
                </p>
                <RoutinePanel
                  rows={routineRows}
                  notices={notices}
                  message={routinePayload?.message}
                />
              </>
            )}
            {tab === "profile" && (
              <>
                <h2 className="page-h">আমার প্রোফাইল</h2>
                <p className="page-sub">
                  ভর্তির সময় দেওয়া সম্পূর্ণ তথ্য — এখানে শুধু দেখা যায়,
                  বদলানো যায় না।
                </p>
                <ProfilePanel profile={profile ?? {}} loaded={profilePayload !== undefined} name={name} regNo={regNo} />
              </>
            )}
          </main>
        </div>
      </div>
      <nav className="bottomnav" aria-label="শিক্ষার্থী পোর্টাল">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "active" : undefined}
            onClick={() => setTab(item.id)}
          >
            <Icon d={ICONS[item.id]} size={21} />
            {item.short}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ---------------- dashboard ---------------- */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

function Dashboard({
  name,
  regNo,
  profile,
  student,
  dues,
  results,
  attendanceAll,
  notices,
  upcoming,
  go,
}: {
  name: string;
  regNo: string;
  profile: ProfileInfo;
  student: Row;
  dues: Row[];
  results: Row[];
  attendanceAll: Row[];
  notices: Row[];
  upcoming: Row[];
  go: (tab: TabId) => void;
}) {
  const next = upcoming[0];
  const now = useNow(Boolean(next));
  const publishAt = next ? new Date(String(next.publishAt)) : null;
  const diff =
    publishAt && !Number.isNaN(publishAt.getTime())
      ? Math.max(publishAt.getTime() - now, 0)
      : 0;
  const cd = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };

  const totalDue = dues.reduce((sum, row) => sum + remainingOf(row), 0);
  const latestResult = results[0];
  const latestResultRow = (latestResult?.result ?? {}) as Row;
  const latestExam = (latestResult?.exam ?? {}) as Row;

  const months = [
    ...new Set(
      attendanceAll.map((row) => String(row.attendanceDate ?? "").slice(0, 7)),
    ),
  ]
    .filter((m) => /^\d{4}-\d{2}$/.test(m))
    .sort();
  const latestMonth = months[months.length - 1];
  const monthRows = latestMonth
    ? attendanceAll.filter((row) =>
        String(row.attendanceDate ?? "").startsWith(latestMonth),
      )
    : [];
  const monthPresent = monthRows.filter(
    (row) => String(row.status).toUpperCase() === "PRESENT",
  ).length;
  const monthPct = monthRows.length
    ? Math.round((monthPresent / monthRows.length) * 100)
    : null;

  const today = new Date();
  const feePreview = [...dues]
    .sort((a, b) => {
      const rank = (row: Row) =>
        String(row.status).toUpperCase() === "PAID" ? 1 : 0;
      return rank(a) - rank(b);
    })
    .slice(0, 4);
  const meta = [
    has(profile?.classNameBn) ? `শ্রেণি: ${String(profile.classNameBn)}` : null,
    has(profile?.sectionNameBn)
      ? `শাখা: ${String(profile.sectionNameBn)}`
      : null,
    has(student.roll) ? `রোল: ${toBn(student.roll as string)}` : null,
    has(profile?.sectionGroupName)
      ? `গ্রুপ: ${String(profile.sectionGroupName)}`
      : null,
    `রেজিস্ট্রেশন নম্বর: ${toBn(regNo)}`,
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="card greet">
        {has(student.photoUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(student.photoUrl)} alt={name} />
        ) : (
          <span className="avatar-txt">{name.slice(0, 1)}</span>
        )}
        <div>
          <div className="hello">আসসালামু আলাইকুম,</div>
          <h2>{name}</h2>
          <div className="meta">
            {meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="date">
          <b>
            {new Intl.DateTimeFormat("bn-BD", { weekday: "long" }).format(
              today,
            )}
          </b>
          {bnDate(today.toISOString())}
        </div>
      </div>

      <div className="stats">
        <div className={`stat${totalDue > 0 ? " warn" : ""}`}>
          <div className="ic" style={{ background: "var(--w50)", color: "var(--w600)" }}>
            <Icon d={ICONS.fees} size={22} />
          </div>
          <div>
            <div className="v">{taka(totalDue)}</div>
            <div className="l">
              মোট বকেয়া
              {totalDue > 0 ? " — স্কুল অফিসে পরিশোধ করুন" : " — কোনো বকেয়া নেই"}
            </div>
          </div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: "var(--p50)", color: "var(--p600)" }}>
            <Icon d={ICONS.results} size={22} />
          </div>
          <div>
            <div className="v">
              {latestResult ? toBn(s(latestResultRow.gpa)) : "—"}
            </div>
            <div className="l">
              সর্বশেষ GPA
              {latestResult
                ? ` — ${s(latestExam.nameBn, "পরীক্ষা")}`
                : " — প্রকাশিত ফলাফল নেই"}
            </div>
          </div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: "var(--a50)", color: "var(--a600)" }}>
            <Icon d={ICONS.attendance} size={22} />
          </div>
          <div>
            <div className="v">
              {monthPct !== null ? `${toBn(monthPct)}%` : "—"}
            </div>
            <div className="l">
              {latestMonth
                ? `উপস্থিতি — ${bnMonthYear(`${latestMonth}-01`)}`
                : "উপস্থিতি — কোনো রেকর্ড নেই"}
            </div>
          </div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: "var(--d50)", color: "var(--d600)" }}>
            <Icon d={ICONS.routine} size={22} />
          </div>
          <div>
            <div className="v">{toBn(notices.length)}</div>
            <div className="l">নতুন নোটিশ — তোমার জন্য প্রযোজ্য</div>
          </div>
        </div>
      </div>

      <div className="grid2">
        <div>
          <div className="sec-title">
            <h3>আসন্ন ফি ইভেন্ট</h3>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                go("fees");
              }}
            >
              সব ফি দেখুন
            </a>
          </div>
          <div className="card" style={{ padding: "6px 20px" }}>
            {feePreview.length ? (
              <ul className="list-clean">
                {feePreview.map((row, index) => {
                  const st = dueStatus(row);
                  const paid = String(row.status).toUpperCase() === "PAID";
                  return (
                    <li className="fee-row" key={String(row.id ?? index)}>
                      <span className="fi"><Icon d={ICONS.fees} /></span>
                      <div className="ft">
                        <b>{s(row.eventNameBn, "ফি ইভেন্ট")}</b>
                        <span>
                          {paid
                            ? `জমা: ${has(row.dueDate) ? bnDate(String(row.dueDate)) : "—"}`
                            : `শেষ তারিখ: ${has(row.dueDate) ? bnDate(String(row.dueDate)) : "—"}`}
                          {String(row.status).toUpperCase() === "PARTIAL"
                            ? " · আংশিক জমা হয়েছে"
                            : ""}
                        </span>
                      </div>
                      <div className="fa">
                        <b>{taka(paid ? row.amount : remainingOf(row))}</b>
                        <span className={`chip ${st.cls}`}>{st.label}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p style={{ margin: "14px 0", color: "var(--n600)" }}>
                কোনো ফি ইভেন্ট নেই।
              </p>
            )}
          </div>
        </div>
        <div>
          <div className="sec-title">
            <h3>সর্বশেষ নোটিশ</h3>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                go("routine");
              }}
            >
              সব নোটিশ
            </a>
          </div>
          <div className="card" style={{ padding: "6px 20px" }}>
            {notices.length ? (
              notices
                .slice(0, 3)
                .map((row, index) => (
                  <NoticeRow key={String(row.id ?? index)} row={row} />
                ))
            ) : (
              <p style={{ margin: "14px 0", color: "var(--n600)" }}>
                কোনো নতুন নোটিশ নেই।
              </p>
            )}
          </div>
        </div>
      </div>

      {next && publishAt && (
        <div className="card countdown" style={{ marginTop: 20 }}>
          <h3>ফলাফল প্রকাশের কাউন্টডাউন</h3>
          <p>
            {s(next.nameBn, "পরীক্ষা")}-এর ফলাফল প্রকাশ{" "}
            {bnDate(publishAt.toISOString())} — ফলাফল প্রকাশের পর এখানেই দেখা
            যাবে।
          </p>
          <div className="cd-grid">
            <div className="cd-cell"><b>{toBn(cd.days)}</b><span>দিন</span></div>
            <div className="cd-cell"><b>{toBn(cd.hours)}</b><span>ঘণ্টা</span></div>
            <div className="cd-cell"><b>{toBn(cd.minutes)}</b><span>মিনিট</span></div>
            <div className="cd-cell"><b>{toBn(cd.seconds)}</b><span>সেকেন্ড</span></div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- results: list -> marksheet ---------------- */
function fullMarksTotal(subjects: Row[]): number {
  return subjects.reduce((sum, sub) => sum + n(sub.fullMarks), 0);
}

function ResultsPanel({
  results,
  upcoming,
  profile,
  student,
  name,
  regNo,
}: {
  results: Row[];
  upcoming: Row[];
  profile: ProfileInfo;
  student: Row;
  name: string;
  regNo: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = results.find(
    (row) => String(((row.result ?? {}) as Row).id ?? "") === selectedId,
  );

  if (selected) {
    const result = (selected.result ?? {}) as Row;
    const exam = (selected.exam ?? {}) as Row;
    const subjects = Array.isArray(selected.subjects)
      ? (selected.subjects as Row[])
      : [];
    const fullTotal = fullMarksTotal(subjects);
    const merit = n(result.meritPosition);
    const classSectionRoll = [
      has(profile?.classNameBn) ? String(profile.classNameBn) : null,
      has(profile?.sectionNameBn) ? String(profile.sectionNameBn) : null,
      has(student.roll) ? toBn(student.roll as string) : null,
    ]
      .filter(Boolean)
      .join(" / ");
    return (
      <>
        <div className="toolbar">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => setSelectedId(null)}
          >
            <Icon d={ICONS.back} size={18} />
            ফলাফল তালিকায় ফিরুন
          </button>
          <span className="sp" />
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => window.print()}
          >
            <Icon d={ICONS.print} size={18} />
            প্রিন্ট করুন
          </button>
        </div>
        <div className="paper">
          <div className="paper-head">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <Logo size={64} />
            </div>
            <h2>আদর্শ মডেল উচ্চ বিদ্যালয়</h2>
            <div className="en">ADARSH MODEL HIGH SCHOOL</div>
            <div>
              <span className="paper-title">
                মার্কশিট — {s(exam.nameBn, "পরীক্ষা")}
              </span>
            </div>
          </div>
          <div className="ms-info">
            <div><span>শিক্ষার্থীর নাম</span><b>{name}</b></div>
            <div><span>রেজিস্ট্রেশন নম্বর</span><b>{toBn(regNo)}</b></div>
            {classSectionRoll && (
              <div><span>শ্রেণি / শাখা / রোল</span><b>{classSectionRoll}</b></div>
            )}
            {has(profile?.sectionGroupName) && (
              <div><span>গ্রুপ</span><b>{String(profile.sectionGroupName)}</b></div>
            )}
            {has(student.fatherNameBn) && (
              <div><span>পিতার নাম</span><b>{String(student.fatherNameBn)}</b></div>
            )}
            {has(student.motherNameBn) && (
              <div><span>মাতার নাম</span><b>{String(student.motherNameBn)}</b></div>
            )}
          </div>
          <div className="tbl-wrap" style={{ boxShadow: "none" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>বিষয়</th>
                  <th className="c">সৃজনশীল (CQ)</th>
                  <th className="c">বহুনির্বাচনি (MCQ)</th>
                  <th className="c">ব্যবহারিক</th>
                  <th className="c">মোট</th>
                  <th className="c">গ্রেড</th>
                  <th className="c">GPA</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, index) => {
                  const absent = Boolean(sub.isAbsent);
                  return (
                    <tr key={index}>
                      <td>{s(sub.nameBn, "বিষয়")}</td>
                      <td className="c">
                        {absent ? "—" : n(sub.cqMarks) > 0 ? toBn(s(sub.cq)) : "—"}
                      </td>
                      <td className="c">
                        {absent ? "—" : n(sub.mcqMarks) > 0 ? toBn(s(sub.mcq)) : "—"}
                      </td>
                      <td className="c">
                        {absent
                          ? "—"
                          : n(sub.practicalMarks) > 0
                            ? toBn(s(sub.practical))
                            : "—"}
                      </td>
                      <td className="c">
                        {absent ? "অনুপস্থিত" : toBn(s(sub.totalMarks))}
                      </td>
                      <td className="c">{s(sub.letter)}</td>
                      <td className="c">{toBn(s(sub.gpa))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="result-strip">
            <div className="cell">
              <b>
                {toBn(s(result.totalMarks))}
                {fullTotal > 0 ? ` / ${toBn(fullTotal)}` : ""}
              </b>
              <span>সর্বমোট নম্বর</span>
            </div>
            <div className="cell">
              <b>{toBn(s(result.gpa))}</b>
              <span>GPA (৫.০০-এর মধ্যে)</span>
            </div>
            <div className="cell">
              <b>{merit > 0 ? ordinalBn(merit) : "—"}</b>
              <span>মেধাক্রম (শ্রেণিতে)</span>
            </div>
            <div className="cell">
              <b>{result.isPassed ? "কৃতকার্য" : "অকৃতকার্য"}</b>
              <span>ফলাফল</span>
            </div>
          </div>
          {has(result.remarks) && (
            <div className="remark">
              <b>মন্তব্য:</b> {String(result.remarks)}
            </div>
          )}
          <div className="paper-sign">
            <div className="sig"><div className="line">শ্রেণি শিক্ষকের স্বাক্ষর</div></div>
            <div className="sig"><div className="line">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {results.length ? (
        <div className="tbl-wrap">
          <table className="tbl resp">
            <thead>
              <tr>
                <th>পরীক্ষার নাম</th>
                <th className="c">মোট নম্বর</th>
                <th className="c">GPA</th>
                <th className="c">মেধাক্রম</th>
                <th className="c">অবস্থা</th>
                <th className="c">মার্কশিট</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => {
                const result = (row.result ?? {}) as Row;
                const exam = (row.exam ?? {}) as Row;
                const subjects = Array.isArray(row.subjects)
                  ? (row.subjects as Row[])
                  : [];
                const fullTotal = fullMarksTotal(subjects);
                const merit = n(result.meritPosition);
                return (
                  <tr key={String(result.id ?? index)}>
                    <td data-l="পরীক্ষার নাম">
                      <b>{s(exam.nameBn, "পরীক্ষা")}</b>
                    </td>
                    <td data-l="মোট নম্বর" className="c">
                      {toBn(s(result.totalMarks))}
                      {fullTotal > 0 ? ` / ${toBn(fullTotal)}` : ""}
                    </td>
                    <td data-l="GPA" className="c">{toBn(s(result.gpa))}</td>
                    <td data-l="মেধাক্রম" className="c">
                      {merit > 0 ? ordinalBn(merit) : "—"}
                    </td>
                    <td data-l="অবস্থা" className="c">
                      <span className="chip chip-paid">প্রকাশিত</span>
                    </td>
                    <td data-l="মার্কশিট" className="c">
                      <button
                        className="btn btn-outline btn-sm"
                        type="button"
                        onClick={() => setSelectedId(String(result.id ?? ""))}
                      >
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyNote>প্রকাশিত ফলাফল নেই।</EmptyNote>
      )}
      {upcoming[0] && (
        <EmptyNote>
          {s(upcoming[0].nameBn, "পরীক্ষা")}-এর ফলাফল এখনো প্রকাশিত হয়নি —
          প্রকাশের তারিখ {bnDate(String(upcoming[0].publishAt))}। ফলাফল প্রকাশ
          হলেই এখানে দেখা যাবে।
        </EmptyNote>
      )}
    </>
  );
}

/* ---------------- fees & receipts (single screen) ---------------- */
function FeesPanel({
  dues,
  payments,
  profile,
  student,
  name,
  regNo,
}: {
  dues: Row[];
  payments: Row[];
  profile: ProfileInfo;
  student: Row;
  name: string;
  regNo: string;
}) {
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const receipt = payments.find((row) => String(row.id ?? "") === receiptId);

  if (receipt) {
    const classSectionRoll = [
      has(profile?.classNameBn) ? String(profile.classNameBn) : null,
      has(profile?.sectionNameBn) ? String(profile.sectionNameBn) : null,
      has(student.roll) ? toBn(student.roll as string) : null,
    ]
      .filter(Boolean)
      .join(" / ");
    return (
      <>
        <div className="toolbar">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => setReceiptId(null)}
          >
            <Icon d={ICONS.back} size={18} />
            ফি তালিকায় ফিরুন
          </button>
          <span className="sp" />
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => window.print()}
          >
            <Icon d={ICONS.print} size={18} />
            প্রিন্ট করুন
          </button>
        </div>
        <div className="paper">
          <div className="paper-head">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <Logo size={64} />
            </div>
            <h2>আদর্শ মডেল উচ্চ বিদ্যালয়</h2>
            <div className="en">ADARSH MODEL HIGH SCHOOL</div>
            <div><span className="paper-title">টাকা গ্রহণের রশিদ</span></div>
          </div>
          <div className="ms-info">
            <div><span>রশিদ নম্বর</span><b>{s(receipt.receiptNumber)}</b></div>
            <div>
              <span>তারিখ</span>
              <b>{has(receipt.paidAt) ? bnDate(String(receipt.paidAt)) : "—"}</b>
            </div>
            <div><span>শিক্ষার্থীর নাম</span><b>{name}</b></div>
            <div><span>রেজিস্ট্রেশন নম্বর</span><b>{toBn(regNo)}</b></div>
            {classSectionRoll && (
              <div><span>শ্রেণি / শাখা / রোল</span><b>{classSectionRoll}</b></div>
            )}
            {has(student.fatherNameBn) && (
              <div><span>পিতার নাম</span><b>{String(student.fatherNameBn)}</b></div>
            )}
          </div>
          <div className="tbl-wrap" style={{ boxShadow: "none" }}>
            <table className="tbl">
              <thead>
                <tr><th>বিবরণ</th><th className="r">পরিমাণ</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{s(receipt.eventNameBn, "ফি")}</td>
                  <td className="r">{taka(receipt.amount)}</td>
                </tr>
                <tr>
                  <td><b>সর্বমোট</b></td>
                  <td className="r"><b>{taka(receipt.amount)}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 14 }}>
            <b>কথায়:</b> {takaInWords(receipt.amount)}।
            {has(receipt.method) &&
              ` · মাধ্যম: ${METHOD_LABELS[String(receipt.method)] ?? String(receipt.method)}`}
          </p>
          <div className="paper-sign">
            <div className="sig"><div className="line">টাকা গ্রহণকারীর স্বাক্ষর</div></div>
            <div className="sig"><div className="line">প্রধান শিক্ষকের সিল ও স্বাক্ষর</div></div>
          </div>
          <p style={{ marginTop: 18, fontSize: 13.5, color: "var(--n600)" }}>
            এই রশিদের সত্যতা স্কুলের ওয়েবসাইটে রশিদ নম্বর দিয়ে যাচাই করা
            যায়।
            {has(receipt.verifyCode) &&
              ` যাচাই কোড: ${String(receipt.verifyCode)}`}
          </p>
        </div>
      </>
    );
  }

  const totalAmount = dues.reduce((sum, row) => sum + n(row.amount), 0);
  const totalPaid = dues.reduce((sum, row) => sum + n(row.paidAmount), 0);
  const totalDue = dues.reduce((sum, row) => sum + remainingOf(row), 0);
  const upcomingDue = dues
    .filter(
      (row) =>
        String(row.status).toUpperCase() !== "PAID" &&
        has(row.dueDate) &&
        String(row.dueDate) > todayStr(),
    )
    .reduce((sum, row) => sum + remainingOf(row), 0);

  return (
    <>
      <div className="sum-strip num">
        <div className="sum-cell"><div className="l">মোট ধার্য</div><div className="v">{taka(totalAmount)}</div></div>
        <div className="sum-cell green"><div className="l">মোট পরিশোধিত</div><div className="v">{taka(totalPaid)}</div></div>
        <div className="sum-cell warn"><div className="l">মোট বকেয়া</div><div className="v">{taka(totalDue)}</div></div>
        <div className="sum-cell"><div className="l">আসন্ন বকেয়া (শেষ তারিখ বাকি)</div><div className="v">{taka(upcomingDue)}</div></div>
      </div>

      <div className="sec-title" style={{ marginTop: 6 }}><h3>ফি ইভেন্টসমূহ</h3></div>
      {dues.length ? (
        <div className="tbl-wrap">
          <table className="tbl resp">
            <thead>
              <tr>
                <th>ইভেন্ট</th>
                <th className="r">পরিমাণ</th>
                <th>শেষ তারিখ</th>
                <th className="r">পরিশোধিত</th>
                <th className="r">বকেয়া</th>
                <th className="c">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {dues.map((row, index) => {
                const st = dueStatus(row);
                return (
                  <tr key={String(row.id ?? index)}>
                    <td data-l="ইভেন্ট"><b>{s(row.eventNameBn, "ফি ইভেন্ট")}</b></td>
                    <td data-l="পরিমাণ" className="r">{taka(row.amount)}</td>
                    <td data-l="শেষ তারিখ">
                      {has(row.dueDate) ? bnDate(String(row.dueDate)) : "—"}
                    </td>
                    <td data-l="পরিশোধিত" className="r">{taka(row.paidAmount)}</td>
                    <td data-l="বকেয়া" className="r"><b>{taka(remainingOf(row))}</b></td>
                    <td data-l="অবস্থা" className="c">
                      <span className={`chip ${st.cls}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyNote>তোমার নামে কোনো ফি ইভেন্টের বকেয়া নেই।</EmptyNote>
      )}

      <div className="sec-title"><h3>পেমেন্ট ইতিহাস</h3></div>
      {payments.length ? (
        <div className="tbl-wrap">
          <table className="tbl resp">
            <thead>
              <tr>
                <th>তারিখ</th>
                <th>রশিদ নম্বর</th>
                <th>ইভেন্ট</th>
                <th>মাধ্যম</th>
                <th className="r">পরিমাণ</th>
                <th className="c">রশিদ</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((row, index) => (
                <tr key={String(row.id ?? index)}>
                  <td data-l="তারিখ">
                    {has(row.paidAt) ? bnDate(String(row.paidAt)) : "—"}
                  </td>
                  <td data-l="রশিদ নম্বর"><b>{s(row.receiptNumber)}</b></td>
                  <td data-l="ইভেন্ট">{s(row.eventNameBn, "ফি")}</td>
                  <td data-l="মাধ্যম">
                    {has(row.method)
                      ? (METHOD_LABELS[String(row.method)] ??
                        String(row.method))
                      : "—"}
                  </td>
                  <td data-l="পরিমাণ" className="r"><b>{taka(row.amount)}</b></td>
                  <td data-l="রশিদ" className="c">
                    <button
                      className="btn btn-outline btn-sm"
                      type="button"
                      onClick={() => setReceiptId(String(row.id ?? ""))}
                    >
                      রশিদ দেখুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyNote>কোনো পেমেন্ট রেকর্ড নেই।</EmptyNote>
      )}
    </>
  );
}

/* ---------------- attendance: real month calendar ---------------- */
function AttendancePanel({
  token,
  allRows,
}: {
  token: string;
  allRows: Row[];
}) {
  const monthsFromData = useMemo(
    () =>
      [
        ...new Set(
          allRows.map((row) => String(row.attendanceDate ?? "").slice(0, 7)),
        ),
      ]
        .filter((m) => /^\d{4}-\d{2}$/.test(m))
        .sort(),
    [allRows],
  );
  const currentYm = todayStr().slice(0, 7);
  const months = useMemo(
    () =>
      [...new Set([...monthsFromData, currentYm])].sort(),
    [monthsFromData, currentYm],
  );
  const [ym, setYm] = useState<string | null>(null);
  const activeYm =
    ym && months.includes(ym)
      ? ym
      : (monthsFromData[monthsFromData.length - 1] ?? currentYm);

  // Month-scoped fetch — the backend filters attendance by ?month=YYYY-MM.
  const { data: monthPayload } = useAuthSWR<ListPayload>(
    token,
    `/student/portal/attendance?month=${activeYm}`,
  );
  const rows = monthPayload
    ? list(monthPayload)
    : allRows.filter((row) =>
        String(row.attendanceDate ?? "").startsWith(activeYm),
      );

  const [yearStr, monthStr] = activeYm.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const byDate = new Map(
    rows.map((row) => [String(row.attendanceDate ?? ""), row]),
  );
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leading = (firstWeekday + 1) % 7; // Saturday-first offset
  const cells: Array<{
    day: number | null;
    dateStr: string;
    status?: string;
    fri: boolean;
    today: boolean;
    future: boolean;
  }> = [];
  for (let i = 0; i < leading; i++)
    cells.push({ day: null, dateStr: "", fri: false, today: false, future: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${activeYm}-${String(d).padStart(2, "0")}`;
    const weekday = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    cells.push({
      day: d,
      dateStr,
      status: byDate.get(dateStr)
        ? String(byDate.get(dateStr)!.status ?? "")
        : undefined,
      fri: weekday === 5,
      today: dateStr === todayStr(),
      future: dateStr > todayStr(),
    });
  }

  const present = rows.filter(
    (row) => String(row.status).toUpperCase() === "PRESENT",
  ).length;
  const absent = rows.filter(
    (row) => String(row.status).toUpperCase() === "ABSENT",
  ).length;
  const pct = rows.length ? Math.round((present / rows.length) * 100) : 0;

  return (
    <>
      <div className="toolbar">
        <div className="month-switch" role="group" aria-label="মাস নির্বাচন">
          {months.map((m) => (
            <button
              key={m}
              type="button"
              className={m === activeYm ? "active" : undefined}
              onClick={() => setYm(m)}
            >
              {bnMonthYear(`${m}-01`)}
            </button>
          ))}
        </div>
      </div>
      <div className="sum-strip num">
        <div className="sum-cell"><div className="l">মোট ক্লাস দিবস</div><div className="v">{toBn(rows.length)} দিন</div></div>
        <div className="sum-cell green"><div className="l">উপস্থিত</div><div className="v">{toBn(present)} দিন</div></div>
        <div className="sum-cell"><div className="l">অনুপস্থিত</div><div className="v" style={{ color: "var(--d600)" }}>{toBn(absent)} দিন</div></div>
        <div className="sum-cell"><div className="l">উপস্থিতির হার</div><div className="v">{toBn(pct)}%</div></div>
      </div>
      <div className="card">
        <div className="cal-head">
          {WEEK_ORDER.map((wd) => (
            <div key={wd} className={wd === 5 ? "fri" : undefined}>
              {DAY_SHORT[wd]}
            </div>
          ))}
        </div>
        <div className="cal">
          {cells.map((cell, index) =>
            cell.day === null ? (
              <div className="day empty" key={`e-${index}`} />
            ) : (
              <div
                className={[
                  "day",
                  cell.fri ? "fri" : "",
                  cell.today ? "today" : "",
                  cell.future ? "future" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={cell.dateStr}
              >
                <span className="dn">{toBn(cell.day)}</span>
                {cell.status && (
                  <span
                    className="st"
                    style={{
                      color:
                        cell.status.toUpperCase() === "PRESENT"
                          ? "var(--a600)"
                          : "var(--d600)",
                    }}
                  >
                    <span
                      className="dot"
                      style={{
                        background:
                          cell.status.toUpperCase() === "PRESENT"
                            ? "var(--a600)"
                            : "var(--d600)",
                      }}
                    />
                    {cell.status.toUpperCase() === "PRESENT"
                      ? "উপস্থিত"
                      : cell.status.toUpperCase() === "ABSENT"
                        ? "অনুপস্থিত"
                        : cell.status}
                  </span>
                )}
              </div>
            ),
          )}
        </div>
        <div className="legend">
          <span><span className="dot" style={{ background: "var(--a600)" }} />উপস্থিত</span>
          <span><span className="dot" style={{ background: "var(--d600)" }} />অনুপস্থিত</span>
          <span><span className="dot" style={{ background: "var(--n400)" }} />ছুটি / সাপ্তাহিক বন্ধ</span>
          <span><span className="dot" style={{ background: "var(--p600)" }} />আজ</span>
        </div>
        {!rows.length && (
          <p style={{ margin: "14px 0 0", color: "var(--n600)" }}>
            এই মাসে কোনো হাজিরা রেকর্ড নেই।
          </p>
        )}
      </div>
      <EmptyNote>
        কোনো দিনের হাজিরা ভুল মনে হলে শ্রেণি শিক্ষকের সঙ্গে যোগাযোগ করুন —
        সংশোধন শুধু শিক্ষক/অ্যাডমিন করতে পারেন।
      </EmptyNote>
    </>
  );
}

/* ---------------- routine + notices ---------------- */
function RoutinePanel({
  rows,
  notices,
  message,
}: {
  rows: Row[];
  notices: Row[];
  message?: string;
}) {
  const periods = [
    ...new Set(rows.map((row) => n(row.period)).filter((p) => p > 0)),
  ].sort((a, b) => a - b);
  return (
    <>
      <div className="sec-title" style={{ marginTop: 6 }}>
        <h3>ক্লাস রুটিন</h3>
      </div>
      {rows.length ? (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>দিন</th>
                {periods.map((p) => (
                  <th key={p} className="c">{toBn(p)}ম পিরিয়ড</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEK_ORDER.filter((wd) => wd !== 5).map((wd) => (
                <tr key={wd}>
                  <td><b>{DAY_NAMES[wd]}</b></td>
                  {periods.map((p) => {
                    const entry = rows.find(
                      (row) =>
                        n(row.dayOfWeek) === wd && n(row.period) === p,
                    );
                    return (
                      <td key={p} className="c">
                        {entry ? (
                          <>
                            {s(entry.subjectNameBn, "বিষয়")}
                            {has(entry.room) && (
                              <small
                                style={{
                                  display: "block",
                                  color: "var(--n600)",
                                }}
                              >
                                কক্ষ: {String(entry.room)}
                              </small>
                            )}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyNote>{message ?? "রুটিন Admin আপলোড করলে এখানে দেখা যাবে।"}</EmptyNote>
      )}

      <div className="sec-title"><h3>আমার নোটিশ</h3></div>
      {notices.length ? (
        <div className="card" style={{ padding: "6px 20px" }}>
          {notices.map((row, index) => (
            <NoticeRow key={String(row.id ?? index)} row={row} />
          ))}
        </div>
      ) : (
        <EmptyNote>কোনো নোটিশ নেই।</EmptyNote>
      )}
    </>
  );
}

/* ---------------- profile (view-only) ---------------- */
function ProfilePanel({
  profile,
  loaded,
  name,
  regNo,
}: {
  profile: ProfileInfo;
  loaded: boolean;
  name: string;
  regNo: string;
}) {
  const student: Row = profile?.student ?? {};
  const user: Row = profile?.user ?? {};
  if (!loaded) return <EmptyNote>প্রোফাইল লোড হচ্ছে…</EmptyNote>;

  const classSectionRoll = [
    has(profile.classNameBn) ? String(profile.classNameBn) : null,
    has(profile.sectionNameBn) ? String(profile.sectionNameBn) : null,
    has(student.roll) ? toBn(student.roll as string) : null,
  ]
    .filter(Boolean)
    .join(" / ");
  const dateVal = (v: unknown): string | null => {
    if (!has(v)) return null;
    const text = String(v);
    const formatted = bnDate(text);
    return formatted || text;
  };
  const genderLabel = (v: unknown): string | null => {
    if (!has(v)) return null;
    const g = String(v).toLowerCase();
    if (g === "male" || g === "ছেলে") return "ছেলে";
    if (g === "female" || g === "মেয়ে") return "মেয়ে";
    return String(v);
  };

  const sections: Array<{ title: string; rows: Array<[string, string]> }> = [
    {
      title: "ব্যক্তিগত তথ্য",
      rows: [
        ["নাম (বাংলায়)", s(user.displayNameBn, "")],
        ["নাম (ইংরেজিতে)", s(student.nameEn, "")],
        ["জন্ম তারিখ", dateVal(student.dateOfBirth) ?? ""],
        ["জন্ম নিবন্ধন নম্বর", s(student.birthCertificateNumber, "")],
        ["লিঙ্গ", genderLabel(student.gender) ?? ""],
        ["ধর্ম", s(student.religion, "")],
        ["রক্তের গ্রুপ", s(student.bloodGroup, "")],
      ].filter(([, v]) => v !== "") as Array<[string, string]>,
    },
    {
      title: "শিক্ষার্থী তথ্য",
      rows: [
        ["রেজিস্ট্রেশন নম্বর", toBn(regNo)],
        ["ভর্তির তারিখ", dateVal(student.admissionDate) ?? ""],
        ["বর্তমান শ্রেণি / শাখা / রোল", classSectionRoll],
        ["গ্রুপ", s(profile.sectionGroupName, "")],
        ["শিফট", s(profile.sectionShift, "")],
        ["বর্তমান সেশন", s(profile.sessionName, "")],
      ].filter(([, v]) => v !== "") as Array<[string, string]>,
    },
    {
      title: "অভিভাবকের তথ্য",
      rows: [
        ["পিতার নাম", s(student.fatherNameBn, "")],
        ["মাতার নাম", s(student.motherNameBn, "")],
        ["অভিভাবকের মোবাইল", s(student.guardianMobile, "")],
      ].filter(([, v]) => v !== "") as Array<[string, string]>,
    },
    {
      title: "ঠিকানা",
      rows: [
        ["বর্তমান ঠিকানা", s(student.presentAddress, "")],
        ["স্থায়ী ঠিকানা", s(student.permanentAddress, "")],
      ].filter(([, v]) => v !== "") as Array<[string, string]>,
    },
    {
      title: "পূর্ববর্তী শিক্ষা",
      rows: [
        ["পূর্ববর্তী বিদ্যালয়", s(student.previousInstitution, "")],
      ].filter(([, v]) => v !== "") as Array<[string, string]>,
    },
  ].filter((section) => section.rows.length > 0);

  return (
    <>
      <div className="card profile-head">
        {has(student.photoUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(student.photoUrl)} alt={name} />
        ) : (
          <span className="avatar-txt">{name.slice(0, 1)}</span>
        )}
        <div>
          <h2>{name}</h2>
          {has(student.nameEn) && (
            <div className="sub">{String(student.nameEn)}</div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            <span className="chip chip-cat">রেজিস্ট্রেশন নম্বর: {toBn(regNo)}</span>
            {has(profile.classNameBn) && (
              <span className="chip chip-cat">শ্রেণি: {String(profile.classNameBn)}</span>
            )}
            {has(profile.sectionNameBn) && (
              <span className="chip chip-cat">শাখা: {String(profile.sectionNameBn)}</span>
            )}
            {has(student.roll) && (
              <span className="chip chip-cat">রোল: {toBn(student.roll as string)}</span>
            )}
            {has(profile.sectionGroupName) && (
              <span className="chip chip-cat">গ্রুপ: {String(profile.sectionGroupName)}</span>
            )}
            <span className="chip chip-cat">
              অবস্থা: {student.isActive === false ? "নিষ্ক্রিয়" : "নিয়মিত ছাত্র"}
            </span>
          </div>
        </div>
      </div>
      {sections.map((section) => (
        <div key={section.title}>
          <div className="sec-title"><h3>{section.title}</h3></div>
          <div className="card">
            <dl className="dl">
              {section.rows.map(([dt, dd]) => (
                <div className="row" key={dt}>
                  <dt>{dt}</dt>
                  <dd>{dd}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ))}
      <EmptyNote>
        তথ্য বদলাতে স্কুল অফিসে যোগাযোগ করুন। প্রোফাইলের কোনো তথ্য ভুল
        থাকলে বা পরিবর্তন প্রয়োজন হলে প্রয়োজনীয় কাগজপত্রসহ স্কুল অফিসে
        আবেদন করুন — পোর্টাল থেকে সরাসরি তথ্য বদলানো যায় না।
      </EmptyNote>
    </>
  );
}
