'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { useBooking } from '@/hooks/useBooking';

interface FooterProps {
  translations: any;
  locale: Locale;
}

export default function Footer({ translations, locale }: FooterProps) {
  const nav = translations?.nav || {};
  const footer = translations?.footer || {};
  const contact = translations?.contact || {};
  
  // TheFork booking hook
  const { openWidget: openReservation, isOpening: isReservationOpening } = useBooking(locale);
  
  // Helper function to safely get translation value (handles both string and {label, value} formats)
  const getLabel = (obj: any, key: string, fallback: string): string => {
    const value = obj[key];
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.label) return value.label;
    return fallback;
  };

  // Opening hours are single-sourced from contact.hours in the locale dictionaries, so
  // the footer, the contact page and the reserve page cannot drift apart again. This
  // block used to hardcode the old evening times in English on BOTH locales, and was the
  // origin of the contradiction with the JSON-LD.
  const hoursSrc = contact?.hours || {};
  const hours = {
    midweek: getLabel(hoursSrc, 'midweek', 'Wed – Mon: 18:00 – 23:30'),
    midweekKitchen: getLabel(hoursSrc, 'midweekKitchen', 'Kitchen closes 23:00'),
    weekend: getLabel(hoursSrc, 'weekend', 'Fri – Sat: 18:00 till late (02:00)'),
    weekendKitchen: getLabel(hoursSrc, 'weekendKitchen', 'Kitchen closes 23:30'),
    closed: getLabel(hoursSrc, 'closed', 'Tuesday: Closed'),
  };

  return (
    <footer className="bg-charcoal text-warm-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 md:pt-10 pb-4 md:pb-6">
        
        {/* Brand Section */}
        <div className="pb-5 mb-5 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {/* Logo - light SVG version */}
              <Image
                src="/images/brand/logo-light.svg"
                alt="maída"
                width={120}
                height={48}
                className="h-12 w-auto mb-2"
              />
              {/* FIXED: Changed from text-stone to text-warm-white/70 for better contrast */}
              <p className="text-warm-white/70 text-sm italic">
                {getLabel(footer, 'tagline', 'Mediterranean Flavours. Lebanese Soul.')}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/maida_lisbon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-warm-white hover:bg-terracotta hover:border-terracotta transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/maida_lisbon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-warm-white hover:bg-terracotta hover:border-terracotta transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Links Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pb-5 border-b border-white/10">
          
          {/* Navigate */}
          <div>
            {/* ACCESSIBILITY FIX: Changed h4 to span for proper heading hierarchy (no h1-h3 before h4) */}
            <span className="block text-sm tracking-[0.15em] uppercase text-terracotta-light mb-3 font-medium">
              {getLabel(footer, 'navigate', 'Navigate')}
            </span>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  {getLabel(nav, 'home', 'Home')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/story`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  {getLabel(nav, 'story', 'Story')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/menu`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  {getLabel(nav, 'menu', 'Menu')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/maida-live`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  Maída Live
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  {getLabel(nav, 'contact', 'Contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <span className="block text-sm tracking-[0.15em] uppercase text-terracotta-light mb-3 font-medium">
              {getLabel(footer, 'discover', 'Discover')}
            </span>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href={`/${locale}/maida-saj`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  {getLabel(footer, 'whatIsSaj', 'What is SAJ?')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/coffee-tea`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  {getLabel(footer, 'coffeeTea', 'Coffee & Tea')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  {getLabel(nav, 'blog', 'Blog')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/faq`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  {getLabel(footer, 'faq', 'FAQ')}
                </Link>
              </li>
              {/* Join Us — visually separated from the rest with a subtle divider */}
              <li className="pt-2 mt-2 border-t border-white/10">
                <Link
                  href={`/${locale}/join-us`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  {getLabel(footer, 'joinUs', 'Join Us')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours - ACCESSIBILITY FIX: Improved contrast throughout */}
          <div>
            <span className="block text-sm tracking-[0.15em] uppercase text-terracotta-light mb-3 font-medium">
              {getLabel(footer, 'hours', 'Hours')}
            </span>
            {/* Opening hours - matched to the reserve page wording */}
            <ul className="text-sm">
              <li className="text-warm-white">{hours.midweek}</li>
              <li className="text-warm-white/60 text-xs mt-0.5">{hours.midweekKitchen}</li>
              <li className="mt-3 text-terracotta-light font-medium">{hours.weekend}</li>
              <li className="text-warm-white/60 text-xs mt-0.5">{hours.weekendKitchen}</li>
              <li className="mt-1.5">
                <span className="inline-block bg-terracotta-light/10 text-terracotta-light text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full">
                  Maída DJ Sessions
                </span>
              </li>
              <li className="mt-3">
                <span className="inline-block bg-white/10 text-warm-white/70 text-[10px] tracking-[0.05em] px-2.5 py-1 rounded">
                  {hours.closed}
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <span className="block text-sm tracking-[0.15em] uppercase text-terracotta-light mb-3 font-medium">
              {getLabel(footer, 'contact', 'Contact')}
            </span>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="mailto:info@maida.pt"
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  info@maida.pt
                </a>
              </li>
              {/* FIXED: Changed text-stone to text-warm-white/70 */}
              <li className="text-warm-white/70 text-sm">
                Rua da Boavista 66
              </li>
              <li className="text-warm-white/70 text-sm">
                Cais do Sodré, Lisboa
              </li>
              <li className="mt-2">
                <button
                  onClick={() => openReservation('button')}
                  disabled={isReservationOpening}
                  className="text-terracotta-light text-sm hover:text-warm-white transition-colors disabled:opacity-70"
                >
                  {isReservationOpening
                    ? getLabel(nav, 'loading', 'Loading...')
                    : getLabel(nav, 'bookTable', 'Book a table')}
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* FIXED: Changed text-stone to text-warm-white/60 */}
          <p className="text-xs text-warm-white/60">
            {getLabel(footer, 'copyright', '© 2026 maída · Cais do Sodré, Lisboa')}
          </p>
          <p className="text-xs text-warm-white/60">
            #MeetMeAtMaida
          </p>
        </div>
      </div>
    </footer>
  );
}
