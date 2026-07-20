// Canonical opening-hours for the meetmeatmaida footer (the single-line `footer_hours`
// setting). This is the ONE place that value is defined. The admin editor and the
// DEFAULT_SETTINGS fallback in both meetmeatmaida API routes import from here, so the
// footer can't silently drift again — it had drifted to "18:00 – Late" when it was a
// free-typed text box with no guardrails.
//
// This mirrors the hours the rest of the site publishes (JSON-LD OPENING_HOURS in
// components/seo/JsonLd.tsx, and contact.hours.* / footer.hoursValue in the locale
// dictionaries). If the hours change, change them in those places too — this module
// deliberately does not import them, because those are display strings in a different
// shape; keeping them in sync is a manual, documented step until a full hours refactor.
//
// Pure constants + string helpers only: no `server-only`, no Prisma, no React — so this
// file is safe to import from both the client admin page and the server API routes.

export interface MeetHoursParts {
  midweekDays: string;    // e.g. "Wed – Mon"
  midweekHours: string;   // e.g. "18:00 – 23:30"
  midweekKitchen: string; // e.g. "23:00"
  weekendDays: string;    // e.g. "Fri – Sat"
  weekendHours: string;   // e.g. "till late ~02:00"
  weekendKitchen: string; // e.g. "23:30"
  closedDay: string;      // e.g. "Tue"
}

export const CANONICAL_MEET_HOURS_PARTS: MeetHoursParts = {
  midweekDays: 'Wed – Mon',
  midweekHours: '18:00 – 23:30',
  midweekKitchen: '23:00',
  weekendDays: 'Fri – Sat',
  weekendHours: 'till late ~02:00',
  weekendKitchen: '23:30',
  closedDay: 'Tue',
};

// Compose the single footer_hours string from structured parts. The admin editor saves
// the composed result; the page renders it verbatim.
export function composeMeetHours(p: MeetHoursParts): string {
  return (
    `${p.midweekDays}: ${p.midweekHours} (kitchen ${p.midweekKitchen})` +
    ` \u00B7 ${p.weekendDays}: ${p.weekendHours} (kitchen ${p.weekendKitchen})` +
    ` \u00B7 ${p.closedDay}: Closed`
  );
}

// Best-effort reverse of composeMeetHours. Returns parts if the value is in the standard
// shape, or null if it isn't (e.g. a legacy free-typed value) — in which case the admin
// editor falls back to a raw text field. parseMeetHours(composeMeetHours(p)) === p.
const MEET_HOURS_RE =
  /^(.+?): (.+?) \(kitchen (.+?)\) \u00B7 (.+?): (.+?) \(kitchen (.+?)\) \u00B7 (.+?): Closed$/;

export function parseMeetHours(value: string): MeetHoursParts | null {
  const m = value.trim().match(MEET_HOURS_RE);
  if (!m) return null;
  return {
    midweekDays: m[1],
    midweekHours: m[2],
    midweekKitchen: m[3],
    weekendDays: m[4],
    weekendHours: m[5],
    weekendKitchen: m[6],
    closedDay: m[7],
  };
}

// The canonical value itself, derived from the parts so the two can't disagree.
export const CANONICAL_MEET_HOURS = composeMeetHours(CANONICAL_MEET_HOURS_PARTS);
