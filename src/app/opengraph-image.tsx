import { ImageResponse } from "next/og";
import { publicHome, type HomeData } from "@/lib/api";

/**
 * Dynamic OG image (Round 6, P4): school name from the public API with a
 * safe fallback, so shared links show a branded preview image (og:image)
 * instead of nothing.
 */
export const alt = "বিদ্যালয়ের ওয়েবসাইট — নোটিশ, ফলাফল ও শিক্ষার্থী পোর্টাল";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const payload = await publicHome<HomeData>().catch(() => null);
  const school = payload?.data?.school;
  const nameBn = school?.nameBn ?? "বিদ্যালয়";
  const nameEn = school?.nameEn ?? "School Portal";
  const address = school?.address ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0B2740 0%, #21699D 60%, #3798EA 100%)",
          color: "#FFFFFF",
          padding: "64px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#DCEBF7",
            marginBottom: 18,
          }}
        >
          {nameEn}
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.2 }}>{nameBn}</div>
        {address ? (
          <div style={{ fontSize: 30, color: "#DCEBF7", marginTop: 22 }}>{address}</div>
        ) : null}
        <div
          style={{
            marginTop: 40,
            fontSize: 26,
            background: "#1E7A46",
            padding: "12px 32px",
            borderRadius: 999,
          }}
        >
          Notices · Results · Admission · Student Portal
        </div>
      </div>
    ),
    { ...size },
  );
}
