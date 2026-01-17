'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface StoryProps {
  translations: any;
  locale: Locale;
}

export default function Story({ translations, locale }: StoryProps) {
  const homeStory = translations?.homeStory || {};
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  // Helper function to safely get translation value
  const t = (key: string, fallback: string): string => {
    const value = homeStory[key];
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.label) return value.label;
    if (typeof value === 'object' && value.value) return value.value;
    return fallback;
  };
  
  return (
    <section ref={ref} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[480px]">
        
        {/* Left - Image */}
        <motion.div
          className="relative h-[280px] md:h-auto overflow-hidden"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <Image
            src="/images/home/gathering-table.webp"
            alt="Friends gathering around the table at Maída"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover scale-150"
          />
        </motion.div>
        
        {/* Right - Terracotta Panel */}
        <motion.div
          className="bg-terracotta flex items-start"
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="px-6 md:px-10 lg:px-12 py-8 md:py-10 max-w-xl">
            {/* Stacked Headline - Now from translations */}
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white leading-[1.1] mb-3">
              <span className="block">{t('headline1', 'FROM')}</span>
              <span className="block">{t('headline2', 'OUR')}</span>
              <span className="block">{t('headline3', 'ROOTS')}</span>
            </h2>
            
            {/* Subtitle */}
            <p className="font-display text-xl md:text-2xl font-semibold text-charcoal mb-5">
              {t('title', 'Where every meal is')} <em className="italic">{t('titleHighlight', 'an invitation')}</em>
            </p>
            
            {/* Body Text - Now from translations */}
            <p className="text-warm-white/90 text-base leading-relaxed mb-5">
              {t('text', 'The word مائدة (ma\'ida) means "the gathering table" in Arabic - where family and friends come together, glasses clink, plates are shared, and time lingers. That\'s the spirit we brought from Beirut to Cais do Sodré.')}
            </p>
            
            {/* CTA Link */}
            <Link
              href={`/${locale}/story`}
              className="inline-block text-warm-white border-b border-warm-white/50 hover:border-warm-white pb-1 transition-colors"
            >
              {t('cta', 'Read Our Story')} →
            </Link>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
