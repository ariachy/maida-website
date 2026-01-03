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
            {/* Updated: "From our roots" as main title (larger font) instead of label */}
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-6">
              From our roots
            </h2>
            
            {/* Section subtitle */}
            <p className="font-display text-xl md:text-2xl text-stone mb-6">
              {story.title || 'Where every meal is'} <em className="text-terracotta italic">{story.titleHighlight || 'an invitation'}</em>
            </p>
            
            <p className="text-stone text-lg leading-relaxed mb-4">
              {story.text1 || "Maída is more than a restaurant - it's an invitation. To slow down. To gather around the table. To share something meaningful."}
            </p>
            
            {/* Updated: Hashtag moved into body text */}
            <p className="text-stone text-lg leading-relaxed mb-8">
              {story.text2 || 'The word مائدة (ma\'ida) means "the gathering table" in Arabic - where family and friends come together, stories are shared, and no one leaves hungry. That\'s the spirit we brought from Beirut to Cais do Sodré.'}{' '}
              <span className="text-terracotta font-medium">#FromOurRoots</span>
            </p>
            
            <Link href={`/${locale}/story`} className="btn btn-ghost">
              {story.cta || 'Read our story'}
            </Link>
          </motion.div>
          
          {/* Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          >
            
            {/* Main visual card with definition inside - SHORTER */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-terracotta-light to-terracotta overflow-hidden group">
              {/* Pattern overlay - MORE VISIBLE like reference image */}
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
                <span className="font-display text-6xl md:text-7xl mb-1 arabic-text">
                  {story.arabicWord || 'مائدة'}
                </span>
                
                {/* Subtitle */}
                <span className="text-xs tracking-[0.25em] uppercase opacity-80 mb-6">
                  Ma&apos;ida
                </span>
                
                {/* Definition */}
                <p className="text-sm md:text-base text-warm-white/90 text-center leading-relaxed max-w-sm">
                  <span className="opacity-70">* المائدة</span>{' '}
                  <span className="italic opacity-70">[al-māʾidah] (noun)</span>{' '}
                  <span>—</span> A communal table; a place where food, stories, and connection come together: a symbol of generosity, community, and togetherness.
                </p>
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