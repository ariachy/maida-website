'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface FooterProps {
  translations: any;
  locale: Locale;
}

export default function Footer({ translations, locale }: FooterProps) {
  const nav = translations?.nav || {};
  const footer = translations?.footer || {};
  
  const handleReserveClick = () => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c',
        widgetType: 'reservation',
      });
      (window as any).umaiWidget.openWidget();
    }
  };
  
  const handleGiftCardClick = () => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c',
        widgetType: 'giftcard',
      });
      (window as any).umaiWidget.openWidget();
    }
  };
  
  return (
    <footer className="bg-charcoal text-warm-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-10 md:pt-16 pb-6 md:pb-8">
        
        {/* Brand Section - Always full width on mobile */}
        <div className="pb-8 mb-8 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Image
                src="/images/brand/logo.png"
                alt="maída"
                width={100}
                height={40}
                className="h-10 w-auto brightness-0 invert mb-2"
              />
              <p className="text-stone text-sm italic">
                {footer.tagline || 'Mediterranean Flavours. Lebanese Soul.'}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/maida.lisboa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-warm-white hover:bg-terracotta hover:border-terracotta transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/maida.lisboa"
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
        
        {/* Links Grid - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 pb-8 border-b border-white/10">
          
          {/* Navigate */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-terracotta-light mb-4 lg:mb-6">
              {footer.navigate || 'Navigate'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/story`}
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  {nav.story || 'Story'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/menu`}
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  {nav.menu || 'Menu'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/maida-live`}
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  Maída Live
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  {nav.contact || 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-terracotta-light mb-4 lg:mb-6">
              Discover
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/saj`}
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  What is SAJ?
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/coffee-tea`}
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  Coffee & Tea
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog`}
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  {nav.blog || 'Blog'}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Hours */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-terracotta-light mb-4 lg:mb-6">
              {footer.hours || 'Hours'}
            </h4>
            <ul className="space-y-1 text-stone text-xs">
              <li>Mon, Wed-Thu, Sun</li>
              <li className="text-warm-white mb-2">12:30 – 23:00</li>
              <li>Friday</li>
              <li className="text-warm-white mb-2">12:30 – 00:00</li>
              <li>Saturday</li>
              <li className="text-warm-white mb-2">12:30 – 02:00</li>
              <li className="text-terracotta-light mt-2">Tuesday closed</li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-terracotta-light mb-4 lg:mb-6">
              {footer.contact || 'Contact'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:info@maida.pt"
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  info@maida.pt
                </a>
              </li>
              <li className="text-stone text-xs leading-relaxed">
                Rua da Boavista 66<br />
                Cais do Sodré, Lisboa
              </li>
              <li>
                <button
                  onClick={handleReserveClick}
                  className="text-terracotta-light text-sm hover:text-warm-white transition-colors"
                >
                  {footer.reservations || 'Reservations'}
                </button>
              </li>
              <li>
                <button
                  onClick={handleGiftCardClick}
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  {footer.giftCards || 'Gift Cards'}
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-stone">
            {footer.copyright || '© 2026 maída · Cais do Sodré, Lisboa'}
          </p>
          <p className="text-xs text-stone">
            #MeetMeAtMaida
          </p>
        </div>
      </div>
    </footer>
  );
}
