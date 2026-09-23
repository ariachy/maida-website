/**
 * Tiny dataLayer helper for GTM.
 * Uses (window as any) so it never fights TypeScript's global Window typing.
 */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}