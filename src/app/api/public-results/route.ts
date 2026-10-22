import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const base =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ??
    "https://school-mangment-backend.vercel.app/api/v1";
  const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "";
  const query = request.nextUrl.searchParams;
  const response = await fetch(
    `${base}/public/results/search?schoolId=${encodeURIComponent(schoolId)}&registrationNumber=${encodeURIComponent(query.get("registrationNumber") ?? "")}`,
    { cache: "no-store" },
  );
  return NextResponse.json(await response.json(), { status: response.status });
}
