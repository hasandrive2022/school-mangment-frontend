import { NextRequest, NextResponse } from "next/server";

function backendUrl() {
  const configured = (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "https://school-mangment-backend.vercel.app/api/v1").replace(/\/+$/, "");
  return configured.endsWith("/api/v1") ? configured : `${configured}/api/v1`;
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const token = request.headers.get("authorization");
  if (!token) return NextResponse.json({ message: "লগইন প্রয়োজন" }, { status: 401 });
  try {
    const response = await fetch(`${backendUrl()}/${path.join("/")}${request.nextUrl.search}`, {
      headers: { Accept: "application/json", Authorization: token },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({ message: "তথ্য লোড করা যায়নি" }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "ব্যাকএন্ডে সংযোগ করা যাচ্ছে না" }, { status: 502 });
  }
}
