"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { generateReactHelpers } from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/core";

const api =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";
const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "a370abb2-8800-41e9-9b5a-3d22575b04f2";
const { useUploadThing } = generateReactHelpers<UploadRouter>();
type AdmissionField = string | { key?: string; name?: string; labelBn?: string; required?: boolean; type?: string };
const fallbackFields: AdmissionField[] = [{ key: "nameBn", labelBn: "শিক্ষার্থীর বাংলা নাম", required: true }, { key: "nameEn", labelBn: "শিক্ষার্থীর ইংরেজি নাম" }, { key: "guardianMobile", labelBn: "অভিভাবকের মোবাইল", required: true }, { key: "admissionClassId", labelBn: "ভর্তির শ্রেণি", required: true }, { key: "sessionId", labelBn: "শিক্ষাবর্ষ", required: true }];

const steps = [
  { n: "১", title: "অনলাইন আবেদন", text: "ওয়েবসাইটের ভর্তি ফর্মটি পূরণ করে জমা দিন ও ট্র্যাকিং নম্বর সংরক্ষণ করুন" },
  { n: "২", title: "যাচাই ও লটারি", text: "আবেদন যাচাই শেষে আসন সংখ্যার বেশি আবেদন হলে লটারির মাধ্যমে নির্বাচন" },
  { n: "৩", title: "ফলাফল ও সাক্ষাৎকার", text: "নির্বাচিতদের তালিকা ওয়েবসাইটে প্রকাশ ও মূল কাগজপত্র যাচাই" },
  { n: "৪", title: "ফি জমা ও ভর্তি নিশ্চিত", text: "নির্ধারিত তারিখের মধ্যে ভর্তি ফি জমা দিলেই ভর্তি সম্পন্ন ও রেজিস্ট্রেশন নম্বর প্রদান" },
];

type StatusResult = {
  trackingId: string;
  status: string;
  reviewNote: string | null;
  createdAt: string | null;
};

const STATUS_LABELS: Record<string, { label: string; chipClass: string }> = {
  PENDING: { label: "অপেক্ষমাণ", chipClass: "chip-amber" },
  APPROVED: { label: "নির্বাচিত / অনুমোদিত", chipClass: "chip-green" },
  REJECTED: { label: "বাতিল", chipClass: "chip-red" },
};

export default function AdmissionClient({
  infoHtml,
}: {
  infoHtml?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [tracking, setTracking] = useState("");
  const [statusResult, setStatusResult] = useState<StatusResult | null>(null);
  const [statusError, setStatusError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [fields, setFields] = useState<AdmissionField[]>(fallbackFields);
  const [form, setForm] = useState<Record<string, string>>({ nameBn: "", nameEn: "", guardianMobile: "", admissionClassId: "", sessionId: "" });
  const { startUpload, isUploading } = useUploadThing("admissionImage", {
    onClientUploadComplete: (files) => { setPhotoUrl(files[0]?.url ?? ""); setPhotoError(""); },
    onUploadError: (error) => setPhotoError(error.message || "ছবি আপলোড করা যায়নি"),
  });

  useEffect(() => {
    void fetch(`${api}/public/admissions/settings?schoolId=${schoolId}`)
      .then((response) => response.json())
      .then((payload: { data?: { isOpen?: boolean; fields?: AdmissionField[] } }) => { setOpen(Boolean(payload.data?.isOpen)); if (payload.data?.fields?.length) setFields(payload.data.fields); });
  }, []);

  async function submit() {
    const response = await fetch(`${api}/public/admissions?schoolId=${schoolId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicant: form, admissionClassId: form.admissionClassId, sessionId: form.sessionId, photoUrl }),
    });
    const payload = await response.json() as { data?: { trackingId?: string }; message?: string };
    setTracking(payload.data?.trackingId ?? payload.message ?? "");
  }

  async function lookup() {
    setStatusResult(null);
    setStatusError("");
    const id = tracking.trim();
    if (!id) {
      setStatusError("ট্র্যাকিং নম্বর লিখুন।");
      return;
    }
    try {
      const response = await fetch(`${api}/public/admissions/status/${encodeURIComponent(id)}?schoolId=${schoolId}`);
      const payload = await response.json() as { data?: { trackingId?: string; status?: string; reviewNote?: string | null; createdAt?: string | null } | null };
      if (payload.data) {
        setStatusResult({
          trackingId: payload.data.trackingId ?? id,
          status: payload.data.status ?? "",
          reviewNote: payload.data.reviewNote ?? null,
          createdAt: payload.data.createdAt ?? null,
        });
      } else {
        setStatusError("আবেদন পাওয়া যায়নি — ট্র্যাকিং নম্বরটি যাচাই করুন।");
      }
    } catch {
      setStatusError("অবস্থা যাচাই করা যায়নি — আবার চেষ্টা করুন।");
    }
  }

  return (
    <>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" /></svg>
            অনলাইন ভর্তি আবেদন ফর্ম
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link><span className="sep">›</span><span>ভর্তি</span><span className="sep">›</span><span className="cur">অনলাইন আবেদন</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        <div className="sec-head"><h2 className="sec-title">ভর্তির ধাপসমূহ</h2></div>
        <div className="steps">
          {steps.map((step) => (
            <div className="step" key={step.n}>
              <div className="sn">{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>

        {infoHtml && (
          <>
            <div className="sec-head" style={{ marginTop: 26 }}><h2 className="sec-title">ভর্তি তথ্য</h2></div>
            <article className="card prose" style={{ padding: "22px 26px" }}>
              <div dangerouslySetInnerHTML={{ __html: infoHtml }} />
            </article>
          </>
        )}

        {open ? (
          <>
            <div className="alert alert-blue" style={{ marginTop: 26 }}>
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
              <span><b>*</b> চিহ্নিত ঘরগুলো অবশ্যই পূরণ করতে হবে। ফর্ম জমা দিলে একটি ট্র্যাকিং নম্বর পাবেন — সেটি সংরক্ষণ করুন, তা দিয়ে পরে আবেদনের অবস্থা দেখতে পারবেন।</span>
            </div>
            <div className="card form-card">
              <h3>
                <svg className="icon" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                আবেদনকারীর তথ্য
              </h3>
              <div className="fc-body">
                <div className="photo-upload" style={{ marginBottom: 18 }}>
                  <label className="photo-box" htmlFor="adm-photo">
                    <svg className="icon" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    ছবি আপলোড করুন
                    <span style={{ fontWeight: 400 }}>(পাসপোর্ট সাইজ)</span>
                  </label>
                  <input id="adm-photo" className="hide" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { setPhotoError("ছবির আকার সর্বোচ্চ ৫ MB হতে পারে"); return; }
                    setPhotoError("");
                    void startUpload([file]);
                  }} />
                  <div>
                    <b style={{ fontSize: 15 }}>শিক্ষার্থীর রঙিন ছবি</b>
                    <p className="small muted" style={{ margin: "3px 0 0" }}>সদ্য তোলা, সাদা পটভূমি। JPG/PNG/WebP, সর্বোচ্চ ৫ MB।</p>
                    {photoError && <p className="text-destructive" style={{ margin: "6px 0 0" }}>{photoError}</p>}
                    {photoUrl && <p className="text-sm text-accent-600" style={{ margin: "6px 0 0" }}>ছবি আপলোড হয়েছে</p>}
                  </div>
                </div>
                <div className="form-grid">
                  {fields.map((field) => { const key = typeof field === "string" ? field : field.key ?? field.name ?? "field"; const labels: Record<string, string> = { nameBn: "শিক্ষার্থীর বাংলা নাম", nameEn: "শিক্ষার্থীর ইংরেজি নাম", guardianMobile: "অভিভাবকের মোবাইল", admissionClassId: "ভর্তির শ্রেণি", sessionId: "শিক্ষাবর্ষ" }; const label = typeof field === "string" ? labels[key] ?? key : field.labelBn ?? key; return (
                    <div className="field" key={key}>
                      <label htmlFor={`adm-${key}`}>{label}{typeof field !== "string" && field.required ? <i> *</i> : ""}</label>
                      <input id={`adm-${key}`} required={typeof field !== "string" && field.required} type={typeof field !== "string" && field.type === "tel" ? "tel" : "text"} value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
                    </div>
                  ); })}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn btn-green btn-lg" type="button" disabled={isUploading} onClick={() => void submit()}>
                    <svg className="icon" viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
                    {isUploading ? "ছবি আপলোড হচ্ছে…" : "আবেদন জমা দিন"}
                  </button>
                </div>
                {tracking && (
                  <div className="adm-track">
                    <span>ট্র্যাকিং নম্বর</span>
                    <b>Tracking ID: {tracking}</b>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="alert alert-red" style={{ marginTop: 26 }}>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5h.01" /></svg>
            <span>ভর্তি আবেদন বর্তমানে বন্ধ।</span>
          </div>
        )}

        <div className="sec-head" style={{ marginTop: 26 }}><h2 className="sec-title">ভর্তির অবস্থা ও ফলাফল</h2></div>
        <div className="card filter-card status-card">
          <h3 style={{ fontSize: 18, color: "var(--p800)", marginBottom: 4 }}>ট্র্যাকিং নম্বর দিয়ে অবস্থা দেখুন</h3>
          <p className="small muted" style={{ margin: "0 0 14px" }}>আবেদনের সময় পাওয়া ট্র্যাকিং নম্বরটি লিখুন।</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div className="field" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
              <input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="যেমন: ADM-2026-XXXXXX" />
            </div>
            <button className="btn btn-primary" type="button" style={{ height: 42 }} onClick={() => void lookup()}>
              <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              অবস্থা দেখুন
            </button>
          </div>
          {statusError && (
            <div className="alert alert-red" style={{ margin: "14px 0 0" }}>
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5h.01" /></svg>
              <span>{statusError}</span>
            </div>
          )}
        </div>
        {statusResult && (() => {
          const mapped = STATUS_LABELS[statusResult.status] ?? { label: statusResult.status, chipClass: "chip-gray" };
          return (
            <div className="card status-result-card">
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
                <span className="avatar av-txt" style={{ width: 56, height: 56, fontSize: 21, borderRadius: "50%" }}>আ</span>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <b style={{ fontSize: 18, color: "var(--p800)" }}>ট্র্যাকিং নং: {statusResult.trackingId}</b>
                  {statusResult.createdAt && (
                    <div className="small muted">আবেদনের তারিখ: {new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" }).format(new Date(statusResult.createdAt))}</div>
                  )}
                </div>
                <span className={`chip ${mapped.chipClass}`} style={{ fontSize: 13.5, padding: "7px 14px" }}>{mapped.label}</span>
              </div>
              <table className="info-table">
                <tbody>
                  <tr><th>ট্র্যাকিং নম্বর</th><td>{statusResult.trackingId}</td></tr>
                  <tr><th>অবস্থা</th><td><b>{mapped.label}</b></td></tr>
                  {statusResult.reviewNote && (
                    <tr><th>মন্তব্য / পরবর্তী করণীয়</th><td>{statusResult.reviewNote}</td></tr>
                  )}
                </tbody>
              </table>
              <p className="small muted" style={{ margin: "12px 0 0" }}>আবেদনকারীর নাম ও শ্রেণি অবস্থা-যাচাই তথ্যে থাকে না — তাই সেগুলো এখানে দেখানো হয়নি।</p>
            </div>
          );
        })()}
      </div>
    </>
  );
}
