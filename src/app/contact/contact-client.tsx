"use client";
import { FormEvent, useState } from "react";
import { toBn } from "@/lib/bn";

export type ContactSchool = {
  nameBn?: string;
  address?: string;
  eiin?: string;
  foundedYear?: string | null;
};

export default function ContactClient({ school }: { school?: ContactSchool }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const api =
      process.env.NEXT_PUBLIC_BACKEND_API_URL ??
      "https://school-mangment-backend.vercel.app/api/v1";
    const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "a370abb2-8800-41e9-9b5a-3d22575b04f2";
    try {
      const response = await fetch(
        `${api}/public/content/contact-messages${schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(form)),
        },
      );
      if (!response.ok) throw new Error("request failed");
      setSent(true);
      event.currentTarget.reset();
    } catch {
      setError("বার্তা পাঠানো যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
    }
  }

  const schoolName = school?.nameBn ?? "আদর্শ মডেল উচ্চ বিদ্যালয়";
  const address = school?.address ?? "কুড়িগ্রাম সদর";
  const mapsQuery = encodeURIComponent(`${schoolName}, ${address}`);

  return (
    <>
      <div className="contact-grid">
        <div className="card contact-card">
          <div className="ci">
            <svg className="icon" viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
          </div>
          <h3>ঠিকানা</h3>
          <p>{schoolName}<br />{address}</p>
        </div>
        <div className="card contact-card">
          <div className="ci">
            <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v5" /></svg>
          </div>
          <h3>প্রতিষ্ঠানের তথ্য</h3>
          <p>
            EIIN: {school?.eiin ? toBn(school.eiin) : "123456"}
            {school?.foundedYear && <><br />স্থাপিত: {toBn(school.foundedYear)} খ্রিস্টাব্দ</>}
          </p>
        </div>
        <div className="card contact-card">
          <div className="ci">
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
          </div>
          <h3>অফিস সময়</h3>
          <p>রবিবার–বৃহস্পতিবার<br />সকাল ৯টা – বিকেল ৪টা</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="map-box">
          <div className="pin">
            <svg className="icon" viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
          </div>
          <b style={{ fontSize: 18, color: "var(--p800)" }}>{schoolName}</b>
          <span className="muted">{address}</span>
          <a
            className="btn btn-primary"
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener"
            style={{ marginTop: 10 }}
          >
            <svg className="icon" viewBox="0 0 24 24"><path d="M9 20l-6-3V4l6 3 6-3 6 3v13l-6-3-6 3ZM9 7v13M15 4v13" /></svg>
            Google Maps-এ দেখুন
          </a>
          <span className="small muted">এখানে ইন্টার‌্যাক্টিভ ম্যাপ বসবে — দিকনির্দেশনার জন্য বাটনে ক্লিক করুন</span>
        </div>

        <div className="card form-card" style={{ margin: 0 }}>
          <h3>
            <svg className="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            বার্তা পাঠান
          </h3>
          <div className="fc-body">
            <form onSubmit={submit}>
              <div className="form-grid">
                <Field name="name" label="নাম" />
                <Field name="mobile" label="মোবাইল" />
                <Field name="email" label="ইমেইল" required={false} />
                <Field name="subject" label="বিষয়" />
                <div className="field form-full">
                  <label htmlFor="ct-message">বার্তা <i>*</i></label>
                  <textarea id="ct-message" name="message" required minLength={5} rows={4} placeholder="বার্তা লিখুন..." />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-primary btn-lg" type="submit">বার্তা পাঠান</button>
              </div>
              {sent && (
                <div className="alert alert-green" style={{ margin: "16px 0 0" }}>
                  <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><path d="M22 4 12 14l-3-3" /></svg>
                  <span>আপনার বার্তা গ্রহণ করা হয়েছে।</span>
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
      </div>
    </>
  );
}

function Field({
  name,
  label,
  required = true,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="field">
      <label htmlFor={`ct-${name}`}>
        {label} {required && <i>*</i>}
      </label>
      <input id={`ct-${name}`} name={name} required={required} />
    </div>
  );
}
