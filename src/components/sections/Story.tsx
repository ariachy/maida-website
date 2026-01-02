'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface StoryProps {
  translations: any;
  locale: Locale;
}

export default function Story({ translations, locale }: StoryProps) {
  const story = translations?.story || {};
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <section id="story" className="section bg-cream" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <p className="section-label">{story.label}</p>
            <h2 className="section-title mb-6">
              {story.title} <em className="section-title-highlight">{story.titleHighlight}</em>
            </h2>
            <p className="text-stone text-lg leading-relaxed mb-4">
              {story.text1}
            </p>
            <p className="text-stone text-lg leading-relaxed mb-8">
              {story.text2}
            </p>
            <Link href={`/${locale}/story`} className="btn btn-ghost">
              {story.cta}
            </Link>
          </motion.div>
          
          {/* Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Decorative accent */}
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-sage -z-10 transition-transform duration-500 hover:-translate-x-2 hover:translate-y-2" />
            
            {/* Floating accent */}
            <div className="absolute -top-5 -right-5 w-24 h-24 bg-rust z-10 animate-float" />
            
            {/* Main visual card */}
            <div className="relative aspect-[4/5] bg-gradient-to-br from-terracotta-light to-terracotta overflow-hidden group">
              {/* Pattern overlay */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              
              {/* Arabic text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-warm-white z-10">
                <span className="font-display text-7xl md:text-8xl mb-2 arabic-text">
                  {story.arabicWord}
                </span>
                <span className="text-xs tracking-[0.25em] uppercase opacity-90">
                  {story.arabicMeaning}
                </span>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
