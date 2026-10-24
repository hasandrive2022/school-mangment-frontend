"use client";

import { useCallback, useEffect, useState } from "react";
import { toBn } from "@/lib/bn";
import { ImagePlaceholder } from "@/components/image-placeholder";

export type GalleryAlbum = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  /** Real item count from the API (0 when the album has no items yet). */
  photoCount: number;
  photos: Array<{ url: string | null; caption: string }>;
};

export function GalleryClient({ albums }: { albums: GalleryAlbum[] }) {
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const album = albums.find((a) => a.id === openAlbumId) ?? null;
  const photos = album?.photos ?? [];

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: 1 | -1) => {
      setLightbox((cur) => {
        if (cur === null || photos.length === 0) return cur;
        return (cur + dir + photos.length) % photos.length;
      });
    },
    [photos.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox, step]);

  return (
    <>
      {album === null ? (
        <div className="album-grid">
          {albums.map((a) => (
            <button
              className="album-card"
              type="button"
              key={a.id}
              onClick={() => setOpenAlbumId(a.id)}
            >
              <span className="im">
                {a.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.coverUrl} alt={a.title} loading="lazy" />
                ) : (
                  <ImagePlaceholder label={a.title} />
                )}
                {a.photoCount > 0 && (
                  <span className="cnt">{toBn(a.photoCount)}টি ছবি</span>
                )}
              </span>
              <span className="bd">
                <h3>{a.title}</h3>
                {a.description && <p>{a.description}</p>}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            className="btn btn-outline btn-sm"
            type="button"
            style={{ marginBottom: 16 }}
            onClick={() => {
              setOpenAlbumId(null);
              setLightbox(null);
            }}
          >
            ‹ সব অ্যালবাম
          </button>
          <div className="sec-head" style={{ marginTop: 0 }}>
            <h2 className="sec-title">{album.title}</h2>
            <span className="small muted">যেকোনো ছবিতে ক্লিক করলে বড় আকারে দেখা যাবে</span>
          </div>
          {photos.length > 0 ? (
            <div className="photo-grid">
              {photos.map((photo, index) => (
                <button
                  type="button"
                  className="photo-item"
                  key={`${photo.url ?? "no-image"}-${index}`}
                  onClick={() => setLightbox(index)}
                >
                  {photo.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.url} alt={photo.caption} loading="lazy" />
                  ) : (
                    <ImagePlaceholder label={photo.caption} />
                  )}
                  <span className="cap">{photo.caption}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="small muted">এই অ্যালবামে এখনো কোনো ছবি যোগ করা হয়নি।</p>
          )}
        </div>
      )}

      {album !== null && lightbox !== null && photos[lightbox] && (
        <div className="overlay open" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <div className="box" onClick={(e) => e.stopPropagation()}>
            <button className="x" type="button" aria-label="বন্ধ করুন" onClick={closeLightbox}>
              <svg className="icon" viewBox="0 0 24 24" width="18"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <figure>
              {photos[lightbox].url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[lightbox].url} alt={photos[lightbox].caption} />
              ) : (
                <ImagePlaceholder label={photos[lightbox].caption} />
              )}
              <figcaption>
                <span>{photos[lightbox].caption}</span>
                <span className="lb-nav">
                  <button className="btn btn-outline btn-sm" type="button" onClick={() => step(-1)}>‹ আগের</button>
                  <button className="btn btn-outline btn-sm" type="button" onClick={() => step(1)}>পরের ›</button>
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      )}
    </>
  );
}
