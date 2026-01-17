'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useUmaiWidget } from '@/components/integrations/UmaiLoader';

interface CTASectionProps {
  translations: any;
}

export default function CTASection({ translations }: CTASectionProps) {
  const cta = translations?.cta || {};
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const { openWidget, isOpening } = useUmaiWidget();
  
  return (
    <section 
      ref={ref}
      className="relative py-16 md:py-20 px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ab5741 0%, #8a4535 100%)',
      }}
    >
      {/* Repeating Emblem Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'url(/images/brand/emblem.svg)',
          backgroundSize: '80px 80px',
          backgroundRepeat: 'repeat',
          filter: 'brightness(0) invert(1)',
        }}
      />
      
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.h2
          className="font-display text-fluid-3xl font-medium text-warm-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {cta.title || 'Your table is waiting'}
        </motion.h2>
        
        <motion.p
          className="text-lg text-warm-white/90 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {cta.subtitle || '#MeetMeAtMaida'}
        </motion.p>
        
        <motion.button
          onClick={openWidget}
          disabled={isOpening}
          className="btn bg-charcoal text-warm-white hover:bg-warm-white hover:text-charcoal disabled:opacity-70"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {isOpening ? 'Loading...' : (cta.button || 'Book a table')}
        </motion.button>
      </div>
    </section>
  );
}
