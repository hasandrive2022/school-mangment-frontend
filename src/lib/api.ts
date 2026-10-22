const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";
const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "";

export async function publicApi<T>(path: string): Promise<T | null> {
  try {
    const joiner = path.includes("?") ? "&" : "?";
    const response = await fetch(`${apiUrl}${path}${schoolId ? `${joiner}schoolId=${encodeURIComponent(schoolId)}` : ""}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch { return null; }
}

export type HomeData = { data: { school?: { nameBn: string; nameEn: string; eiin: string; address: string; foundedYear: string | null; logoUrl: string | null }; stats?: { students: number; teachers: number }; teachers: Array<{ id: string; nameBn: string; username: string | null }>; meritoriousStudents: Array<{ id: string; nameBn: string; registrationNumber: string | null }>; blocks: Array<{ key: string; titleBn: string; isEnabled: boolean; orderIndex: number }>; menuItems: Array<{ id: string; labelBn: string; href: string; isVisible: boolean; orderIndex: number }>; banners: Array<{ imageUrl: string; titleBn: string; captionBn: string | null; href: string | null }>; pages: Array<{ id: string; slug: string; titleBn: string; body: string }>; notices: Array<{ id: string; titleBn: string; category: string; isPinned: boolean; createdAt: string; details: string }>; news: Array<{ id: string; titleBn: string; summary: string; imageUrl: string | null; publishedAt: string | null }>; events: Array<{ id: string; titleBn: string; details: string; venue: string | null; startsAt: string }>; services: Array<{ id: string; titleBn: string; icon: string }>; serviceLinks: Array<{ id: string; serviceBoxId: string; labelBn: string; href: string }>; galleries: Array<{ id: string; titleBn: string; coverUrl: string | null }>; downloads: Array<{ id: string; titleBn: string; fileUrl: string; category: string }>; links: Array<{ id: string; labelBn: string; url: string }>; quotes: Array<{ textBn: string; authorBn: string | null }>; messages: Array<{ personNameBn: string; designationBn: string; body: string; photoUrl: string | null }> } };
