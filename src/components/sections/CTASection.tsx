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
      className="relative py-24 md:py-32 px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #C67D5E 0%, #A65D3F 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.h2
          className="font-display text-fluid-3xl font-light text-warm-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {cta.title}
        </motion.h2>
        
        <motion.p
          className="text-lg text-warm-white/90 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {cta.subtitle}
        </motion.p>
        
        <motion.button
          onClick={handleReserveClick}
          className="btn bg-charcoal text-warm-white hover:bg-warm-white hover:text-charcoal"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {cta.button}
        </motion.button>
      </div>
    </section>
  );
}
