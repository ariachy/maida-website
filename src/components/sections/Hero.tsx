'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface HeroProps {
  translations: any;
  locale: Locale;
}

export default function Hero({ translations, locale }: HeroProps) {
  const hero = translations?.hero || {};
  
  const handleReserveClick = () => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c',
        widgetType: 'reservation',
      });
      (window as any).umaiWidget.openWidget();
    }
  };
  
  return (
    <section className="relative min-h-0 md:min-h-[70vh] flex items-center justify-center overflow-hidden pt-24 pb-8 md:py-0 md:pb-16">
      {/* Arabic Watermark - centered behind content */}
      <div className="arabic-watermark top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        مائدة
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-[10%] right-[10%] w-[300px] md:w-[400px] h-[300px] md:h-[400px] rounded-full bg-terracotta-light/40 blur-[80px] animate-float hidden md:block" />
      <div className="absolute bottom-[20%] left-[5%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] rounded-full bg-sage-light/40 blur-[80px] animate-float hidden md:block" style={{ animationDelay: '-7s' }} />
      <div className="absolute top-[60%] right-[25%] w-[150px] md:w-[200px] h-[150px] md:h-[200px] rounded-full bg-sand/40 blur-[80px] animate-float hidden md:block" style={{ animationDelay: '-14s' }} />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center md:pt-20">
        {/* Location Badge - Two lines */}
        <motion.div
          className="mb-2 md:mt-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-sm md:text-base tracking-[0.2em] uppercase text-stone mb-1">
            Restaurant-bar
          </p>
          <p className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-terracotta">
            <span className="w-8 h-px bg-terracotta" />
            Cais do Sodré, Lisboa
            <span className="w-8 h-px bg-terracotta" />
          </p>
        </motion.div>
        
        {/* Title */}
        <h1 className="font-display text-fluid-5xl font-light leading-[1.05] mt-12 md:mt-0 mb-14 md:mb-10">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
            >
              {hero.title1 || 'Mediterranean Flavours.'}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-terracotta italic"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.45, ease: [0.19, 1, 0.22, 1] }}
            >
              {hero.title2 || 'Lebanese Soul.'}
            </motion.span>
          </span>
        </h1>
        
        {/* CTAs - Always side by side */}
        <motion.div
          className="flex flex-row gap-3 md:gap-4 justify-center mb-2 md:mb-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button onClick={handleReserveClick} className="btn btn-primary text-sm md:text-base px-4 md:px-6 py-3">
            {hero.cta || 'Reserve a table'}
          </button>
          <Link href={`/${locale}/menu`} className="btn btn-ghost text-sm md:text-base px-4 md:px-6 py-3">
            {hero.viewMenu || 'View menu'}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
