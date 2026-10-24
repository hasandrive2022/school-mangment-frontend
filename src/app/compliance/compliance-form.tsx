"use client";

import { FormEvent, useState } from "react";

export default function ComplianceForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const api =
      process.env.NEXT_PUBLIC_BACKEND_API_URL ??
      "https://school-mangment-backend.vercel.app/api/v1";
    const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "";
    const response = await fetch(
      `${api}/public/content/contact-messages${schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : ""}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      },
    );
    if (response.ok) {
      setSent(true);
      event.currentTarget.reset();
    } else setError("অভিযোগ পাঠানো যায়নি। আবার চেষ্টা করুন।");
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
            <button className="btn btn-danger btn-lg" type="submit">
              <svg className="icon" viewBox="0 0 24 24"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
              অভিযোগ জমা দিন
            </button>
          </div>
          {sent && (
            <div className="alert alert-green" style={{ margin: "16px 0 0" }}>
              <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><path d="M22 4 12 14l-3-3" /></svg>
              <span><b>অভিযোগ গৃহীত হয়েছে।</b> ধন্যবাদ — অভিযোগ প্রতিকার ব্যবস্থাপনার আওতায় বিষয়টি পর্যালোচনা করা হবে।</span>
            </div>
          )}
          {error && (
            <div className="alert alert-red" style={{ margin: "16px 0 0" }}>
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11v5" /></svg>
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
