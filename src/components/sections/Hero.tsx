'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeroProps {
  translations: any;
}

export default function Hero({ translations }: HeroProps) {
  const hero = translations?.hero || {};
  
  // Helper function to safely get translation value
  const getHeroLabel = (key: string, fallback: string): string => {
    const value = hero[key];
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.label) return value.label;
    if (typeof value === 'object' && value.value) return value.value;
    return fallback;
  };
  
  return (
    <section className="relative min-h-[calc(100svh-100px)] md:min-h-[calc(100svh-120px)] flex flex-col overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/maida-table.webp"
          alt="Maída Table Setup"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-charcoal/40" />
      </div>
      
      {/* Arabic Watermark - centered behind content */}
      <div className="arabic-watermark top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-warm-white/10">
        مائدة
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col flex-1 w-full">
        
        {/* ============================================
            SECTION 1: Restaurant-bar & Cais do Sodré
            - Positioned near top (below navbar)
            - Very tight line spacing between the two lines
            ============================================ */}
        <motion.div
          className="pt-24 md:pt-28"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Restaurant-bar and Cais do Sodré stacked tightly */}
          <p className="text-sm md:text-base tracking-[0.2em] uppercase text-warm-white/90 leading-tight mb-0">
            Restaurant-bar
          </p>
          {/* Cais do Sodré - minimal spacing */}
          <p className="inline-flex items-center gap-3 md:gap-4 text-xs tracking-[0.3em] uppercase text-terracotta-light leading-tight mt-0.5">
            <span className="w-6 md:w-8 h-px bg-terracotta-light" />
            Cais do Sodré, Lisboa
            <span className="w-6 md:w-8 h-px bg-terracotta-light" />
          </p>
        </motion.div>
        
        {/* ============================================
            SECTION 2: Mediterranean Flavours. Lebanese Soul.
            - Centered in remaining space
            - Responsive margin from section 1
            ============================================ */}
        <div className="flex-1 flex items-center justify-center">
          <h1 className="font-display text-fluid-5xl font-medium">
            {/* Mediterranean Flavours - tight line height */}
            <span className="block leading-[0.95]">
              <motion.span
                className="block text-warm-white"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                {getHeroLabel('title1', 'Mediterranean Flavours.')}
              </motion.span>
            </span>
            {/* Lebanese Soul - reduced margin for tighter spacing */}
            <span className="block mt-1 md:mt-2">
              <motion.span
                className="block text-terracotta-light italic leading-[0.95]"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.45, ease: [0.19, 1, 0.22, 1] }}
              >
                {getHeroLabel('title2', 'Lebanese Soul.')}
              </motion.span>
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}
