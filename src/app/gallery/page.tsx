import Link from "next/link";
import PublicShell from "@/components/site-chrome";
import { publicApi, type GalleriesResponse } from "@/lib/api";
import { GalleryClient, type GalleryAlbum } from "./gallery-client";

const FALLBACK_COVER = "https://placehold.co/600x450/21699D/FFFFFF?text=Gallery";

export default async function GalleryPage() {
  const payload = await publicApi<GalleriesResponse>("/public/content/galleries");
  const rows = payload?.data ?? [];
  const albums: GalleryAlbum[] = rows.map((row) => {
    const items = [...(row.items ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const photos = items.map((item) => ({
      url: item.imageUrl,
      caption: item.captionBn?.trim() ? item.captionBn : row.titleBn,
    }));
    if (photos.length === 0 && row.coverUrl) {
      photos.push({ url: row.coverUrl, caption: row.titleBn });
    }
    return {
      id: row.id,
      title: row.titleBn,
      description: row.descriptionBn ?? null,
      coverUrl: row.coverUrl ?? items[0]?.imageUrl ?? FALLBACK_COVER,
      photoCount: items.length,
      photos,
    };
  });

  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L6 21" /></svg>
            ফটো গ্যালারি
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span className="cur">ফটো গ্যালারি</span>
          </nav>
        </div>
      </div>
      <main className="container page-body">
        {albums.length > 0 ? (
          <GalleryClient albums={albums} />
        ) : (
          <p className="small muted center">কোনো অ্যালবাম এখনো প্রকাশিত হয়নি।</p>
        )}
      </main>
    </PublicShell>
  );
}
