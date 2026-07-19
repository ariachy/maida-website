'use client';

/**
 * ReserveClient — the /[lang]/reserve landing page body.
 *
 * Purpose-built for Google Ads / Meta Ads traffic. Layout (top to bottom):
 * title → hours (with DJ pill) → Reserve now button → groups phone box →
 * directions. No emblem; the navbar carries the wordmark.
 *
 * Booking opens on the visitor's click (no auto-open). In the default
 * 'redirect' mode the click opens TheFork in a new tab; nothing from
 * TheFork loads on this page beforehand.
 *
 * THEFORK EMBED: to show TheFork inline on this page instead of redirecting,
 * set mode: 'widget' + a widgetUrl in lib/booking.ts. This page then renders
 * the iframe below (showForkEmbed).
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Locale } from '@/lib/i18n';
import {
  useBooking,
  useBookingConfirmationListener,
  trackBookingEvent,
} from '@/hooks/useBooking';
import { BOOKING_PROVIDER, BOOKING_CONFIG, RESTAURANT_INFO } from '@/lib/booking';

interface ReserveClientProps {
  translations: any;
  locale: Locale;
}

export default function ReserveClient({
  translations,
  locale,
}: ReserveClientProps) {
  const { openWidget, isOpening, unavailable } = useBooking(locale);
  useBookingConfirmationListener();

  const [showForkEmbed] = useState(
    BOOKING_PROVIDER === 'thefork' &&
      BOOKING_CONFIG.thefork.mode === 'widget' &&
      !!(BOOKING_CONFIG.thefork.widgetUrl[locale] || BOOKING_CONFIG.thefork.widgetUrl.en)
  );

  const isPt = locale === 'pt';

  // Copy is hardcoded here (not read from locale JSON) so the page always
  // shows the latest wording regardless of what an older translation script
  // wrote into en.json/pt.json.
  const t = {
    title: isPt ? 'RESERVAR' : 'RESERVE',
    cta: isPt ? 'Reservar mesa' : 'Book a table',
    loading: isPt ? 'A abrir…' : 'Opening…',
    hoursWeekdays: isPt ? 'Qua – Seg · 17:00 – 23:00' : 'Wed – Mon · 17:00 – 23:00',
    hoursWeekend: isPt ? 'Sex & Sáb · 17:00 – 01:00' : 'Fri & Sat · 17:00 – 01:00',
    djPill: 'Maída DJ Sessions',
    closedChip: isPt ? 'Ter · Fechado' : 'Tue · Closed',
    phoneBoxLabel: isPt
      ? 'Grupos de 10+, eventos privados ou outros pedidos'
      : 'Groups of 10+, private events or other requests',
    directions: isPt ? 'Como chegar' : 'Directions',
    unavailable: isPt
      ? 'O sistema de reservas demorou a responder. Tente novamente ou ligue-nos.'
      : 'The booking system is taking a moment. Try again, or give us a call.',
  };

  useEffect(() => {
    trackBookingEvent('reserve_page_view', { locale });
    // No provider script loads on this page in redirect mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPhoneClick = () => trackBookingEvent('phone_click');
  const onDirectionsClick = () => trackBookingEvent('directions_click');

  return (
    <section className="min-h-screen flex flex-col items-center bg-warm-white px-4 pt-32 md:pt-40 pb-20">
      <div className="w-full max-w-sm text-center">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="font-display text-fluid-3xl text-charcoal tracking-[0.12em]">
            {t.title}
          </h1>
        </motion.div>

        {/* Hours */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 mb-14"
        >
          <p className="text-sm text-charcoal whitespace-nowrap">
            {t.hoursWeekdays} <span className="text-stone mx-1">|</span> {t.closedChip}
          </p>
          <p className="text-sm text-charcoal mt-2">{t.hoursWeekend}</p>
          <p className="font-display italic text-rust text-xs mt-0.5">
            {t.djPill}
          </p>
        </motion.div>

        {/* 4 — Booking */}
        {showForkEmbed ? (
          <div className="mb-10 border border-sand bg-white">
            <iframe
              src={BOOKING_CONFIG.thefork.widgetUrl[locale] || BOOKING_CONFIG.thefork.widgetUrl.en}
              title="Reservations"
              className="w-full"
              style={{ minHeight: 560, border: 0 }}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <button
              onClick={() => openWidget('button')}
              disabled={isOpening}
              className="btn btn-primary w-full py-3 text-sm md:text-base disabled:opacity-70"
            >
              {isOpening ? t.loading : t.cta}
            </button>
            {unavailable && (
              <p className="mt-4 text-sm text-terracotta">{t.unavailable}</p>
            )}
          </motion.div>
        )}

        {/* 6 — Groups / same-day phone box (tappable) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mb-8"
        >
          <a
            href={RESTAURANT_INFO.phoneHref}
            onClick={onPhoneClick}
            className="block w-full bg-sand/40 hover:bg-sand/60 transition-colors rounded-lg px-4 py-3"
          >
            <span className="block text-[11px] text-stone leading-relaxed">
              {t.phoneBoxLabel}
            </span>
            <span className="block text-sm text-charcoal mt-1">
              {RESTAURANT_INFO.phone}
            </span>
          </a>
        </motion.div>

        {/* 7 — Directions, last */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-xs text-stone"
        >
          {RESTAURANT_INFO.address.split(',')[0]}, Lisboa ·{' '}
          <a
            href={RESTAURANT_INFO.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDirectionsClick}
            className="text-terracotta hover:underline underline-offset-4"
          >
            {t.directions}
          </a>
        </motion.p>
      </div>
    </section>
  );
}
