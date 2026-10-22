"use client";

import { useEffect, useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const api =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";
const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "";
const { useUploadThing } = generateReactHelpers<UploadRouter>();
type AdmissionField = string | { key?: string; name?: string; labelBn?: string; required?: boolean; type?: string };
const fallbackFields: AdmissionField[] = [{ key: "nameBn", labelBn: "শিক্ষার্থীর বাংলা নাম", required: true }, { key: "nameEn", labelBn: "শিক্ষার্থীর ইংরেজি নাম" }, { key: "guardianMobile", labelBn: "অভিভাবকের মোবাইল", required: true }, { key: "admissionClassId", labelBn: "ভর্তির শ্রেণি", required: true }, { key: "sessionId", labelBn: "শিক্ষাবর্ষ", required: true }];

export default function AdmissionPage() {
  const [open, setOpen] = useState(false);
  const [tracking, setTracking] = useState("");
  const [status, setStatus] = useState("");
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
    const response = await fetch(`${api}/public/admissions/status/${encodeURIComponent(tracking)}?schoolId=${schoolId}`);
    const payload = await response.json() as { data?: { status?: string; reviewNote?: string } };
    setStatus(payload.data ? `${payload.data.status} ${payload.data.reviewNote ?? ""}` : "আবেদন পাওয়া যায়নি");
  }

  return <main className="public-page"><div className="public-page-inner admission-layout">
    <Card><CardHeader><CardTitle>অনলাইন ভর্তি আবেদন</CardTitle></CardHeader><CardContent>
      {open ? <div className="grid gap-3">
        {fields.map((field) => { const key = typeof field === "string" ? field : field.key ?? field.name ?? "field"; const labels: Record<string, string> = { nameBn: "শিক্ষার্থীর বাংলা নাম", nameEn: "শিক্ষার্থীর ইংরেজি নাম", guardianMobile: "অভিভাবকের মোবাইল", admissionClassId: "ভর্তির শ্রেণি", sessionId: "শিক্ষাবর্ষ" }; const label = typeof field === "string" ? labels[key] ?? key : field.labelBn ?? key; return <label className="admission-field" key={key}><span>{label}{typeof field !== "string" && field.required ? " *" : ""}</span><Input required={typeof field !== "string" && field.required} type={typeof field !== "string" && field.type === "tel" ? "tel" : "text"} value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>; })}
        <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) { setPhotoError("ছবির আকার সর্বোচ্চ ৫ MB হতে পারে"); return; }
          setPhotoError("");
          void startUpload([file]);
        }} />
        {photoError && <p className="text-destructive">{photoError}</p>}
        {photoUrl && <p className="text-sm text-accent-600">ছবি আপলোড হয়েছে</p>}
        <Button disabled={isUploading} onClick={() => void submit()}>{isUploading ? "ছবি আপলোড হচ্ছে…" : "আবেদন জমা দিন"}</Button>
        {tracking && <p className="text-accent-600">Tracking ID: {tracking}</p>}
      </div> : <p>ভর্তি আবেদন বর্তমানে বন্ধ।</p>}
    </CardContent></Card>
    <Card className="mt-6"><CardHeader><CardTitle>আবেদনের অবস্থা</CardTitle></CardHeader><CardContent className="flex gap-3">
      <Input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Tracking ID" /><Button onClick={() => void lookup()}>দেখুন</Button>{status && <p>{status}</p>}
    </CardContent></Card>
  </div></main>;
}
