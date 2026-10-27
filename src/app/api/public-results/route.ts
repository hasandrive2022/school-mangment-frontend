import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const requestCounts = new Map<string, { count: number; startedAt: number }>();

export async function GET(request: NextRequest) {
  const registrationNumber = request.nextUrl.searchParams.get("registrationNumber")?.trim() ?? "";
  if (!/^[A-Za-z0-9-]{1,40}$/.test(registrationNumber)) {
    return NextResponse.json({ message: "একটি বৈধ রেজিস্ট্রেশন নম্বর দিন।" }, { status: 400 });
  }

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const bucket = requestCounts.get(address);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) requestCounts.set(address, { count: 1, startedAt: now });
  else if (bucket.count >= MAX_REQUESTS) return NextResponse.json({ message: "অনেকগুলো অনুরোধ করা হয়েছে। পরে আবার চেষ্টা করুন।" }, { status: 429 });
  else bucket.count += 1;

  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "https://school-mangment-backend.vercel.app/api/v1";
  const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "a370abb2-8800-41e9-9b5a-3d22575b04f2";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(`${base}/public/results/search?schoolId=${encodeURIComponent(schoolId)}&registrationNumber=${encodeURIComponent(registrationNumber)}`, { cache: "no-store", signal: controller.signal });
    const text = await response.text();
    let payload: unknown;
    try { payload = JSON.parse(text); } catch { payload = { message: "সার্ভার থেকে অবৈধ উত্তর পাওয়া গেছে।" }; }
    return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
  } catch {
    return NextResponse.json({ message: "ফলাফল সেবা এই মুহূর্তে পাওয়া যাচ্ছে না।" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
