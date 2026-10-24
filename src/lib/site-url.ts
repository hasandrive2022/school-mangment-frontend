/**
 * Single source of truth for the public site URL (Round 6, P4).
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — explicit production URL when configured.
 *  2. https:// + VERCEL_URL — Vercel always sets this on deployments, so
 *     production output (canonical / sitemap / robots / og:url) NEVER
 *     contains "localhost" just because NEXT_PUBLIC_SITE_URL was missed.
 *  3. http://localhost:3000 — local development only.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}
