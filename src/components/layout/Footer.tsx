'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { useUmaiWidget, useUmaiGiftCard } from '@/components/integrations/UmaiLoader';

interface FooterProps {
  translations: any;
  locale: Locale;
}

export default function Footer({ translations, locale }: FooterProps) {
  const nav = translations?.nav || {};
  const footer = translations?.footer || {};
  
  // UMAI Widget hooks
  const { openWidget: openReservation, isOpening: isReservationOpening } = useUmaiWidget();
  const { openGiftCard, isOpening: isGiftCardOpening } = useUmaiGiftCard();
  
  // Helper function to safely get translation value (handles both string and {label, value} formats)
  const getLabel = (obj: any, key: string, fallback: string): string => {
    const value = obj[key];
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.label) return value.label;
    return fallback;
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
                href="https://instagram.com/maida.lisbon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-warm-white hover:bg-terracotta hover:border-terracotta transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/maida.lisbon"
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
            {/* FIXED: Changed h4 from text-xs to text-sm for better readability */}
            <h4 className="text-sm tracking-[0.15em] uppercase text-terracotta-light mb-3 font-medium">
              {getLabel(footer, 'navigate', 'Navigate')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  Home
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
            <h4 className="text-sm tracking-[0.15em] uppercase text-terracotta-light mb-3 font-medium">
              Discover
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href={`/${locale}/maida-saj`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  What is SAJ?
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/coffee-tea`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  Coffee & Tea
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog`}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm tracking-[0.15em] uppercase text-terracotta-light mb-3 font-medium">
              {getLabel(footer, 'hours', 'Hours')}
            </h4>
            {/* Opening hours */}
            <ul className="text-warm-white/50">
              <li className="text-warm-white">Mon–Tue</li>
              <li>Closed</li>
              <li className="mt-2 text-warm-white">Wed, Thu, Sun</li>
              <li>12:30 - 23:00</li>
              <li className="text-warm-white/50 text-xs">Kitchen closes 22:30</li>
              <li className="mt-2 text-warm-white">Fri–Sat</li>
              <li>12:30 - 01:00</li>
              <li className="text-warm-white/50 text-xs">Kitchen closes 23:30</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm tracking-[0.15em] uppercase text-terracotta-light mb-3 font-medium">
              {getLabel(footer, 'contact', 'Contact')}
            </h4>
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
                Rua da Boavista 66, Cais do Sodré, Lisboa
              </li>
              <li className="text-warm-white/70 text-sm">
                
              </li>
              <li className="mt-2">
                <button
                  onClick={openReservation}
                  disabled={isReservationOpening}
                  className="text-terracotta-light text-sm hover:text-warm-white transition-colors disabled:opacity-70"
                >
                  {isReservationOpening ? 'Loading...' : 'Book a table'}
                </button>
              </li>
              <li>
                <button
                  onClick={openGiftCard}
                  disabled={isGiftCardOpening}
                  className="text-warm-white/70 text-sm hover:text-warm-white transition-colors disabled:opacity-70"
                >
                  {isGiftCardOpening ? 'Loading...' : getLabel(footer, 'giftCards', 'Gift Cards')}
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
