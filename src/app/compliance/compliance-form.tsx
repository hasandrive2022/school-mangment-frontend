"use client";

import { FormEvent, useState } from "react";

/**
 * GRS complaint form (Round 6, P3):
 * - Posts to the COMPLAINTS resource (/public/content/complaints), NOT
 *   contact-messages — previously complaints landed in the contact inbox.
 * - Single status state: success XOR error, never both at once (the live
 *   bug showed green + red together); status is cleared on every submit.
 * - The complaints API returns { data: { id, message } } — the id is shown
 *   as the complaint reference number on success.
 */
type Status =
  | { kind: "success"; refId?: string }
  | { kind: "error"; message: string }
  | null;

export default function ComplianceForm() {
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const formEl = event.currentTarget;
    setStatus(null);
    setSubmitting(true);
    const form = new FormData(formEl);
    const api =
      process.env.NEXT_PUBLIC_BACKEND_API_URL ??
      "https://school-mangment-backend.vercel.app/api/v1";
    const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "a370abb2-8800-41e9-9b5a-3d22575b04f2";
    try {
      const response = await fetch(
        `${api}/public/content/complaints${schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(form)),
        },
      );
      if (!response.ok) throw new Error("request failed");
      const payload = (await response.json().catch(() => null)) as {
        data?: { id?: string };
      } | null;
      setStatus({ kind: "success", refId: payload?.data?.id });
      formEl.reset();
    } catch {
      setStatus({
        kind: "error",
        message: "অভিযোগ পাঠানো যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card form-card" style={{ maxWidth: 820 }}>
      <h3>
        <svg className="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        অভিযোগ ফর্ম — অভিযোগ প্রতিকার ব্যবস্থাপনা (GRS)
      </h3>
      <div className="fc-body">
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="cpName">আপনার নাম <i>*</i></label>
              <input id="cpName" name="name" required placeholder="পুরো নাম লিখুন" />
            </div>
            <div className="field">
              <label htmlFor="cpMobile">মোবাইল নম্বর <i>*</i></label>
              <input id="cpMobile" name="mobile" inputMode="tel" required placeholder="01XXXXXXXXX" />
            </div>
            <div className="field">
              <label htmlFor="cpSubject">অভিযোগের বিষয় <i>*</i></label>
              <select id="cpSubject" name="subject" required defaultValue="">
                <option value="" disabled>নির্বাচন করুন</option>
                <option>ফি সংক্রান্ত</option>
                <option>ভর্তি সংক্রান্ত</option>
                <option>শিক্ষক/কর্মচারীর আচরণ</option>
                <option>অবকাঠামো ও সুবিধা</option>
                <option>অন্যান্য</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="cpEmail">ইমেইল (ঐচ্ছিক)</label>
              <input id="cpEmail" name="email" placeholder="ইমেইল ঠিকানা" />
            </div>
            <div className="field form-full">
              <label htmlFor="cpBody">অভিযোগের বিবরণ <i>*</i></label>
              <textarea id="cpBody" name="message" rows={4} required minLength={5} placeholder="বিস্তারিত লিখুন..." />
            </div>
          </div>
          <label className="checkline" style={{ marginTop: 14 }}>
            <input type="checkbox" /> পরিচয় গোপন রেখে অভিযোগ করতে চাই (নাম প্রকাশ করা হবে না)
          </label>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-danger btn-lg" type="submit" disabled={submitting}>
              <svg className="icon" viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
              {submitting ? "পাঠানো হচ্ছে…" : "অভিযোগ জমা দিন"}
            </button>
          </div>
          {status?.kind === "success" && (
            <div className="alert alert-green" style={{ margin: "16px 0 0" }} role="status">
              <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><path d="M22 4 12 14l-3-3" /></svg>
              <span>
                <b>অভিযোগ গৃহীত হয়েছে।</b> ধন্যবাদ — অভিযোগ প্রতিকার ব্যবস্থাপনার আওতায় বিষয়টি পর্যালোচনা করা হবে।
                {status.refId && (
                  <>
                    <br />
                    অভিযোগের রেফারেন্স নম্বর: <b>{status.refId}</b> — পরবর্তী যোগাযোগের জন্য এটি সংরক্ষণ করুন।
                  </>
                )}
              </span>
            </div>
          )}
          {status?.kind === "error" && (
            <div className="alert alert-red" style={{ margin: "16px 0 0" }} role="alert">
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
              <span>{status.message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
