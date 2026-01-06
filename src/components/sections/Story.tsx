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
        {/* 
          MOBILE: 1 column - Title, Subtitle, Visual, Paragraphs, Button (source order)
          DESKTOP: 2 columns - Left (all text), Right (visual)
          Using CSS grid placement to achieve this without affecting desktop
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
          
          {/* Title + Subtitle - Always first on mobile, top-left on desktop */}
          <motion.div
            className="lg:col-start-1 lg:row-start-1"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* "From our roots" as main title */}
            <p className="text-sm tracking-[0.2em] uppercase text-terracotta mb-3">
              From our roots
            </p>
            
            {/* Section subtitle */}
            <p className="font-display text-xl md:text-2xl text-stone mb-0">
              {story.title || 'Where every meal is'} <em className="text-terracotta italic">{story.titleHighlight || 'an invitation'}</em>
            </p>
          </motion.div>
          
          {/* Visual - Second on mobile, right column spanning both rows on desktop */}
          <motion.div
            className="lg:col-start-2 lg:row-start-1 lg:row-span-2"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Main visual card with definition inside */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-terracotta-light to-terracotta overflow-hidden group">
              {/* Pattern overlay */}
              <div 
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `url('/images/brand/emblem.svg')`,
                  backgroundSize: '70px',
                  backgroundRepeat: 'repeat',
                }}
              />
              
              {/* Content with Arabic text AND definition */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-warm-white z-10 px-6 md:px-10">
                {/* Arabic word */}
                <span className="font-display text-5xl md:text-7xl mb-1 arabic-text">
                  {story.arabicWord || 'مائدة'}
                </span>
                
                {/* Subtitle */}
                <span className="text-xs tracking-[0.25em] uppercase opacity-80 mb-4 md:mb-6">
                  Ma&apos;ida
                </span>
                
                {/* Definition */}
                <p className="text-sm md:text-lg text-warm-white/90 text-center leading-relaxed max-w-sm">
                  <span className="opacity-70">* المائدة</span>{' '}
                  <span className="italic opacity-70">[al-māʾidah] (noun)</span>{' '}
                  <span>—</span> A communal table; a place where glasses clink, plates share, and time lingers.
                </p>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500" />
            </div>
          </motion.div>
          
          {/* Paragraphs + Button - Third on mobile, bottom-left on desktop */}
          <motion.div
            className="lg:col-start-1 lg:row-start-2 lg:-mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          >
            
            {/* Hashtag in body text */}
            <p className="text-stone text-lg leading-relaxed mb-6 lg:mb-8">
              {story.text2 || 'In Arabic, مائدة (ma\'ida) means "the gathering table" - where family and friends come together, glasses are never empty, stories grow louder with every round, and no one leaves hungry. That\'s the spirit we brought from Beirut to Cais do Sodré.'}{' '}
              <span className="text-terracotta font-medium">#FromOurRoots</span>
            </p>
            
            <Link href={`/${locale}/story`} className="btn btn-ghost">
              {story.cta || 'Read our story'}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
