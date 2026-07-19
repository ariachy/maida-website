'use client';

/**
 * useBooking — reservation hook (TheFork).
 *
 * Components call `openWidget()` and never touch the provider directly.
 * All analytics events use neutral names (booking_*) so GA4/GTM history
 * stays continuous across the provider change.
 *
 * dataLayer events emitted:
 *   booking_widget_open      { trigger: 'auto' | 'button', booking_provider }
 *   booking_widget_unavailable
 *   booking_message          { message_hint }   ← only fires in 'widget' (embed) mode
 *   booking_completed_signal                    ← only fires in 'widget' (embed) mode
 *
 * NOTE on conversions: in the default 'redirect' mode the booking completes
 * on thefork.com in a new tab, so no confirmation postMessage reaches this
 * page. Wire Ads/Meta conversions to `booking_widget_open` (the click) in GTM.
 * The postMessage listener below only produces signals if you switch to the
 * inline 'widget' embed mode.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { BOOKING_PROVIDER, BOOKING_CONFIG } from '@/lib/booking';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

/** Push a booking-related event to GTM. Safe to call anywhere. */
export function trackBookingEvent(
  event: string,
  params: Record<string, any> = {}
) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    booking_provider: BOOKING_PROVIDER,
    ...params,
  });
}

function openTheFork(locale: string, onDone: (ok: boolean) => void) {
  const cfg = BOOKING_CONFIG.thefork;
  const bookingUrl = cfg.bookingUrl[locale] || cfg.bookingUrl.en;
  const widgetUrl = cfg.widgetUrl[locale] || cfg.widgetUrl.en;

  // redirect mode: open TheFork in a new tab (nothing loads on maida.pt).
  if (cfg.mode === 'redirect' && bookingUrl) {
    window.open(bookingUrl, '_blank', 'noopener');
    onDone(true);
    return;
  }

  // widget mode: the inline iframe in ReserveClient renders it, so opening
  // from a button is a no-op success (the embed is already on the page).
  if (cfg.mode === 'widget' && widgetUrl) {
    onDone(true);
    return;
  }

  // No URL configured yet (THEFORK_BOOKING_URL is empty) → report unavailable
  // so the UI can show the fallback instead of opening a blank tab.
  onDone(false);
}

export function useBooking(locale: string = 'en') {
  const [isOpening, setIsOpening] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const openWidget = useCallback((trigger: 'auto' | 'button' = 'button') => {
    trackBookingEvent('booking_widget_open', { trigger, locale });
    setIsOpening(true);

    const done = (ok: boolean) => {
      setIsOpening(false);
      if (!ok) {
        setUnavailable(true);
        trackBookingEvent('booking_widget_unavailable', { trigger });
      }
    };

    openTheFork(locale, done);
  }, [locale]);

  return { openWidget, isOpening, unavailable };
}

/**
 * Best-effort "reservation completed" detection for the inline 'widget'
 * embed mode. Listens for postMessage from TheFork's iframe origin and:
 *   1. pushes every message type to the dataLayer as `booking_message`
 *      (inspect in GA4 DebugView / GTM Preview to learn what TheFork emits),
 *   2. if the payload looks like a confirmation, pushes
 *      `booking_completed_signal` — wire your Ads/Meta conversions to this.
 *
 * In redirect mode this never fires (booking happens in another tab); use
 * `booking_widget_open` as the conversion proxy there.
 */
export function useBookingConfirmationListener() {
  const seen = useRef(false);

  useEffect(() => {
    const PROVIDER_ORIGINS = ['thefork'];
    const CONFIRM_HINTS = [
      'confirm',
      'success',
      'complete',
      'booked',
      'reservation_created',
    ];

    const handler = (e: MessageEvent) => {
      try {
        if (!PROVIDER_ORIGINS.some((o) => e.origin.includes(o))) return;

        const raw =
          typeof e.data === 'string' ? e.data : JSON.stringify(e.data ?? '');
        const hint = raw.slice(0, 200); // never push huge/PII payloads

        trackBookingEvent('booking_message', { message_hint: hint });

        const lower = raw.toLowerCase();
        if (!seen.current && CONFIRM_HINTS.some((h) => lower.includes(h))) {
          seen.current = true;
          trackBookingEvent('booking_completed_signal');
        }
      } catch {
        /* never break the page over analytics */
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
}
