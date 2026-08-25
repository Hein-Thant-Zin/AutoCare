import type { SWRConfiguration } from 'swr'

/**
 * Shared SWR config: cache-first.
 * Data is fetched once per session (until mutated) — tab switches
 * render from cache with zero network requests.
 */
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  dedupingInterval: 10_000,
}
