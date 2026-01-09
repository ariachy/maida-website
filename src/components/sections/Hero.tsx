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
    <section className="relative min-h-[calc(100svh-100px)] md:min-h-[calc(100svh-120px)] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/hero-bg.webp"
          alt="Maída Restaurant"
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
      
      {/* Content - Vertically centered, with top offset for navbar */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-16 md:pt-20">
        {/* Location Badge */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-sm md:text-base tracking-[0.2em] uppercase text-warm-white/90 mb-0">
            Restaurant-bar
          </p>
          <p className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-terracotta-light mt-1">
            <span className="w-8 h-px bg-terracotta-light" />
            Cais do Sodré, Lisboa
            <span className="w-8 h-px bg-terracotta-light" />
          </p>
        </motion.div>
        
        {/* Title */}
        <h1 className="font-display text-fluid-5xl font-medium">
          {/* Mediterranean Flavours - tighter line height */}
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
          {/* Lebanese Soul - with extra top margin for more distance */}
          <span className="block mt-3 md:mt-4">
            <motion.span
              className="block text-terracotta-light italic"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.45, ease: [0.19, 1, 0.22, 1] }}
            >
              {getHeroLabel('title2', 'Lebanese Soul.')}
            </motion.span>
          </span>
        </h1>
      </div>
    </section>
  );
}
