# Maída — UMAI → TheFork swap (redirect mode)

## ⚠️ ONE required edit before you build
Open `src/lib/booking.ts` and paste your TheFork URL into `THEFORK_BOOKING_URL`
(top of the file). Get it from TheFork Manager → Install booking widget, e.g.
`https://widget.thefork.com/pt/<your-restaurant-uuid>`. Copy the UUID verbatim.
Until this is filled, Reserve buttons will show the "unavailable" fallback
instead of opening a blank tab.

## Also delete these two files from your repo (fully retired):
- src/components/integrations/UmaiLoader.tsx
- src/components/integrations/UmaiLoaderConditional.tsx

## Files in this package (drop over your repo, preserving paths):
src/lib/booking.ts                              (rewritten: TheFork-only, 1 URL constant)
src/hooks/useBooking.ts                         (rewritten: UMAI logic removed)
src/app/layout.tsx                              (removed UMAI suppressor + preconnect + loader mount)
src/app/not-found.tsx                           (removed UMAI <Script>; now uses useBooking)
src/app/meetmeatmaida/page.tsx                  (removed UMAI hide-CSS hack)
src/components/layout/Navbar.tsx                (useUmaiWidget → useBooking, 2 triggers)
src/components/layout/Footer.tsx                (reservation → useBooking; gift-card button removed)
src/components/sections/HeroCTA.tsx             (useUmaiWidget → useBooking)
src/components/sections/CTASection.tsx          (useUmaiWidget → useBooking)
src/components/blog/BlogPostClient.tsx          (inline UMAI → useBooking)
src/components/coffee/CoffeeTeaClient.tsx       (inline UMAI → useBooking)
src/components/maida-live/MaidaLiveClient.tsx   (inline UMAI → useBooking)
src/components/saj/SAJClient.tsx                (inline UMAI → useBooking)
src/components/story/StoryClient.tsx            (inline UMAI → useBooking)
src/components/privacy/PrivacyClient.tsx        (privacy policy: UMAI → TheFork, EN+PT)
src/components/booking/ReserveClient.tsx        (stale UMAI comments cleaned; logic unchanged)

## GDPR note
Redirect mode loads NOTHING from TheFork on maida.pt — no script, no cookie,
no request until the visitor clicks Reserve (which navigates them to TheFork
in a new tab). So there is nothing to consent-gate; Consent Mode v2 defaults
stay denied and are untouched.
