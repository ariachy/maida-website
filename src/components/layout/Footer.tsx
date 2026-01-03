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
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-16 pb-6 md:pb-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-8 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Image
                src="/images/brand/logo.png"
                alt="maída"
                width={120}
                height={48}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-stone text-sm italic mb-6">
              {footer.tagline || 'Mediterranean Flavours. Lebanese Soul.'}
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/maida.lisboa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-warm-white hover:bg-terracotta hover:border-terracotta transition-all duration-300 hover:-translate-y-1"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/maida.lisboa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-warm-white hover:bg-terracotta hover:border-terracotta transition-all duration-300 hover:-translate-y-1"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Navigate */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-terracotta-light mb-6">
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
            <h4 className="text-xs tracking-[0.15em] uppercase text-terracotta-light mb-6">
              Discover
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/maida-saj`}
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
            <h4 className="text-xs tracking-[0.15em] uppercase text-terracotta-light mb-6">
              {footer.hours || 'Hours'}
            </h4>
            <ul className="space-y-2 text-stone text-sm">
              <li className="flex justify-between">
                <span>Mon, Wed, Thu, Sun</span>
              </li>
              <li className="text-warm-white text-xs mb-3">12:30 – 23:00</li>
              <li className="flex justify-between">
                <span>Friday</span>
              </li>
              <li className="text-warm-white text-xs mb-3">12:30 – 00:00</li>
              <li className="flex justify-between">
                <span>Saturday</span>
              </li>
              <li className="text-warm-white text-xs mb-3">12:30 – 02:00</li>
              <li className="text-terracotta-light text-xs mt-2">Tuesday closed</li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-terracotta-light mb-6">
              {footer.contact || 'Contact'}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@maida.pt"
                  className="text-stone text-sm hover:text-warm-white transition-colors"
                >
                  info@maida.pt
                </a>
              </li>
              <li className="text-stone text-sm">
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
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-stone">
            {footer.copyright || '© 2026 maída · Cais do Sodré, Lisboa'}
          </p>
          <p className="text-sm text-stone">
            #MeetMeAtMaida
          </p>
        </div>
      </div>
    </footer>
  );
}
