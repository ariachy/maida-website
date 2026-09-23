'use client';

import Image from 'next/image';
import { track } from '@/lib/analytics';
import { useConsentCategory } from '@/lib/consent-state';

const DIRECTIONS_URL = 'https://maps.app.goo.gl/mYPmDCBEvfEQq1yz8';

const EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2849.8846023983865!2d-9.15119542455817!3d38.70891275780444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd193332b934a279%3A0x3191bb53cc89ae9!2sma%C3%ADda%20%7C%20Mediterranean%20Flavours%2C%20Lebanese%20Soul!5e1!3m2!1sen!2slb!4v1768684138120!5m2!1sen!2slb';

/**
 * Location map.
 *
 * No consent  -> static image that links out to Google Maps. Zero third-party
 *                requests, zero cookies, still fully useful.
 * Consent     -> the real interactive Google Maps embed.
 *
 * Gated on the `functional` category: the embed enables a feature rather than
 * measuring anything, and it sets Google cookies, so it must not load before
 * the visitor has opted in.
 */
export default function FindUsMap({
  locale = 'en',
  ctaLocation = 'homepage_map',
}: {
  locale?: string;
  ctaLocation?: string;
}) {
  const isPt = locale === 'pt';
  const canEmbed = useConsentCategory('functional');

  if (canEmbed) {
    return (
      <iframe
        src={EMBED_URL}
        title={isPt ? 'Mapa — Maída, Lisboa' : 'Map — Maída, Lisbon'}
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return (
    <a
      href={DIRECTIONS_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('directions_click', { cta_location: ctaLocation, locale })}
      className="block relative w-full h-full overflow-hidden group cursor-pointer"
      aria-label={isPt ? 'Abrir no Google Maps' : 'Open in Google Maps'}
    >
      <Image
        src="/images/map-maida.webp"
        alt={
          isPt
            ? 'Mapa — Rua da Boavista 66, Cais do Sodré, Lisboa'
            : 'Map — Rua da Boavista 66, Cais do Sodré, Lisbon'
        }
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </a>
  );
}