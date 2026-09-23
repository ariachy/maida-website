'use client';

import FindUsMap from '@/components/sections/FindUsMap';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Locale } from '@/lib/i18n';
import { track } from '@/lib/analytics';

interface VisitProps {
  translations: any;
  locale: Locale;
}

export default function Visit({ translations, locale }: VisitProps) {
  const homeVisit = translations?.homeVisit || {};
  const address = homeVisit?.address || {};
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Helper function to get translation
  const t = (key: string, fallback: string): string => {
    const value = homeVisit[key];
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    return fallback;
  };

  const handleDirectionsClick = () => {
    track('directions_click', { cta_location: 'homepage_text', locale });
    window.open('https://maps.app.goo.gl/mYPmDCBEvfEQq1yz8', '_blank');
  };
  
  return (
    <section ref={ref} className="w-full mb-12 md:mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[450px]">
        
        {/* Left - Map */}
        <motion.div
          className="relative h-[280px] md:h-full md:min-h-[400px] order-2 md:order-1"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <FindUsMap locale={locale} />
        </motion.div>
        
        {/* Right - Cream Panel with Emblem Pattern */}
        <motion.div
          className="bg-cream flex items-start order-1 md:order-2 relative overflow-hidden"
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Emblem Pattern Background */}
          <div 
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'url(/images/brand/emblem.svg)',
              backgroundSize: '60px 60px',
              backgroundRepeat: 'repeat',
            }}
          />
          
          <div className="px-6 md:px-10 lg:px-12 py-8 md:py-10 relative z-10">
            {/* Stacked Title - Now from translations */}
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-[1.1] mb-8 md:mb-10">
              {t('headline1', 'FIND')} {t('headline2', 'US')}
            </h2>
            
            {/* Address - Now from translations */}
            <div className="text-charcoal/80">
              <p className="text-base md:text-lg text-charcoal">
                {address.street || 'Rua da Boavista 66'}<br />
                {address.postal || '1200-068 Lisboa'}
              </p>
            </div>
            
            {/* CTA - Now from translations */}
            <button
              onClick={handleDirectionsClick}
              className="mt-6 inline-block text-charcoal border-b border-charcoal/50 hover:border-charcoal pb-1 transition-colors"
            >
              {t('directions', 'Directions')} →
            </button>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}