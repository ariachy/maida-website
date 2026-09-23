'use client';

import { useEffect, useState } from 'react';

/**
 * Read-only view of the visitor's stored cookie consent.
 *
 * Deliberately separate from `useConsent()`: that hook OWNS the banner and
 * pushes `consent_update` to the dataLayer on mount. Components that only need
 * to ask "may I load this third-party embed?" must not trigger those effects,
 * or every embed on the page would emit a duplicate consent event.
 */

export type ConsentCategory = 'analytics' | 'functional' | 'advertising';

const CONSENT_STORAGE_KEY = 'maida_cookie_consent';

/** Fired by useConsent() whenever the visitor saves new preferences. */
export const CONSENT_CHANGED_EVENT = 'consent-changed';

export function getStoredConsent(): Record<string, boolean> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Reactive read of one consent category.
 *
 * Returns false on the server and on the first client render — localStorage
 * isn't readable during SSR, and returning anything else would cause a
 * hydration mismatch. The real value lands immediately after mount, and again
 * whenever consent changes (including from another tab).
 */
export function useConsentCategory(category: ConsentCategory): boolean {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const read = () => setGranted(getStoredConsent()?.[category] === true);

    read();
    window.addEventListener(CONSENT_CHANGED_EVENT, read);
    window.addEventListener('storage', read);

    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, read);
      window.removeEventListener('storage', read);
    };
  }, [category]);

  return granted;
}
