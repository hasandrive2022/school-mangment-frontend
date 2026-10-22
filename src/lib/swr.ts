import useSWR from "swr";

export async function portalFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json().catch(() => null)) as T;
  if (!response.ok) {
    throw new Error("তথ্য লোড করা যায়নি");
  }
  return payload;
}

export function usePortalSWR<T>(
  key: string | null,
  options?: Parameters<typeof useSWR<T>>[2],
) {
  return useSWR<T>(key, portalFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    ...options,
  });
}
