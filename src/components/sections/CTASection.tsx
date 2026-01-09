'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface CTASectionProps {
  translations: any;
}

export default function CTASection({ translations }: CTASectionProps) {
  const cta = translations?.cta || {};
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
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
        
        {/* UPDATED: "Book a table" text */}
        <motion.button
          onClick={handleReserveClick}
          className="btn bg-charcoal text-warm-white hover:bg-warm-white hover:text-charcoal"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {cta.button || 'Book a table'}
        </motion.button>
      </div>
    </section>
  );
}
