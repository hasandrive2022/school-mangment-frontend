import { NextRequest, NextResponse } from "next/server";

function backendUrl() {
  const configured = (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "https://school-mangment-backend.vercel.app/api/v1").replace(/\/+$/, "");
  return configured.endsWith("/api/v1") ? configured : `${configured}/api/v1`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  try {
    const response = await fetch(`${backendUrl()}/auth/student-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({ message: "লগইন করা যায়নি" }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "ব্যাকএন্ডে সংযোগ করা যাচ্ছে না।" }, { status: 502 });
  }
}
