"use client";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
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
    } else setError("বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।");
  }
  return (
    <main className="public-page">
      <div className="public-page-inner contact-layout">
        <div>
          <p className="public-kicker">সরাসরি যোগাযোগ</p>
          <h1 className="public-page-title">যোগাযোগ</h1>
          <p className="contact-intro">
            বিদ্যালয়ের যেকোনো তথ্য, পরামর্শ বা প্রশ্নের জন্য আমাদের লিখুন।
          </p>
          <div className="contact-info-card">
            <b>আদর্শ মডেল উচ্চ বিদ্যালয়</b>
            <span>কুড়িগ্রাম সদর · EIIN 123456</span>
            <span>রবিবার–বৃহস্পতিবার · সকাল ৯টা–বিকেল ৪টা</span>
          </div>
        </div>
        <form onSubmit={submit} className="public-card contact-form">
          <h2>বার্তা পাঠান</h2>
          <Field name="name" label="নাম" />
          <Field name="mobile" label="মোবাইল" />
          <Field name="email" label="ইমেইল" required={false} />
          <Field name="subject" label="বিষয়" />
          <label>
            বার্তা
            <Textarea name="message" required minLength={5} />
          </label>
          <Button type="submit">বার্তা পাঠান</Button>
          {sent && (
            <p className="contact-success">আপনার বার্তা গ্রহণ করা হয়েছে।</p>
          )}
          {error && <p className="contact-error">{error}</p>}
        </form>
      </div>
    </main>
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
    <label>
      {label}
      <Input name={name} required={required} />
    </label>
  );
}
