/**
 * BOOKING PROVIDER CONFIGURATION
 * ==============================
 * Single source of truth for the reservation system.
 *
 * Provider: TheFork.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  THE ONLY THING YOU MUST EDIT BEFORE DEPLOY:                         │
 * │  Paste your public TheFork booking URL into THEFORK_BOOKING_URL      │
 * │  below. Get it from TheFork Manager → Install booking widget, or     │
 * │  from your public page. It looks like:                              │
 * │     https://widget.thefork.com/pt/<your-restaurant-uuid>            │
 * │  (a bare thefork.pt/restaurant/... listing URL also works).         │
 * │  Do NOT guess the UUID — copy it verbatim from TheFork.             │
 * └─────────────────────────────────────────────────────────────────────┘
 */

// ▼▼▼ PASTE YOUR THEFORK URL BETWEEN THE QUOTES ▼▼▼
export const THEFORK_BOOKING_URL = 'https://widget.thefork.com/337ec46b-933a-4cda-8984-0d1b1a72d904';

export type BookingProvider = 'thefork';

export const BOOKING_PROVIDER: BookingProvider = 'thefork';

export const BOOKING_CONFIG = {
  thefork: {
    /**
     * mode 'redirect' → opens your TheFork page in a new tab on the user's
     *                   click. Nothing from TheFork loads on maida.pt, so
     *                   there is no script/cookie/request before the click
     *                   (GDPR-clean by construction).
     * mode 'widget'   → embeds TheFork inline on /reserve via ReserveClient.
     *                   Only switch to this if you want the on-page embed;
     *                   it will load TheFork's iframe on that page.
     *
     * TheFork serves one localized page per market; for Lisbon the same PT
     * URL is used for every site locale (the widget UI localizes itself),
     * so all locales below point at THEFORK_BOOKING_URL.
     */
    mode: 'redirect' as 'widget' | 'redirect',
    widgetUrl: {
      en: THEFORK_BOOKING_URL,
      pt: THEFORK_BOOKING_URL,
    } as Record<string, string>,
    bookingUrl: {
      en: THEFORK_BOOKING_URL,
      pt: THEFORK_BOOKING_URL,
    } as Record<string, string>,
  },
} as const;

/** Restaurant facts used on the reserve page (kept here so they're easy to update). */
export const RESTAURANT_INFO = {
  phone: '+351 966 604 674',
  phoneHref: 'tel:+351966604674',
  address: 'Rua da Boavista 66, 1200-068 Lisboa',
  directionsUrl:
    'https://maps.app.goo.gl/mYPmDCBEvfEQq1yz8',
};
