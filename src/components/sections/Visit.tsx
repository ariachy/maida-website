'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Locale } from '@/lib/i18n';
import LazyMap from '@/components/common/LazyMap';

interface VisitProps {
  translations: any;
  locale: Locale;
}

export default function Visit({ translations, locale }: VisitProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleDirectionsClick = () => {
    window.open('https://maps.google.com/?q=Rua+da+Boavista+66+Lisboa', '_blank');
  };
  
  return (
    <section ref={ref} className="w-full mb-12 md:mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[450px]">
        
        {/* Left - Map (UPDATED: Using LazyMap for deferred loading) */}
        <motion.div
          className="relative h-[280px] md:h-auto order-2 md:order-1"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <LazyMap
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2849.8846023983865!2d-9.15119542455817!3d38.70891275780444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd193332b934a279%3A0x3191bb53cc89ae9!2sma%C3%ADda%20%7C%20Mediterranean%20Flavours%2C%20Lebanese%20Soul!5e1!3m2!1sen!2slb!4v1768684138120!5m2!1sen!2slb"
            title="Maída Location"
          />
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
            {/* Stacked Title */}
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-[1.1] mb-6 md:mb-8">
              <span className="block">FIND</span>
              <span className="block">US</span>
            </h2>
            
            {/* Info Grid */}
            <div className="text-charcoal/80">
              {/* Hours */}
              <div className="text-sm md:text-base space-y-0.5 mb-8">
                <p>Mon, Wed, Thu, Sun: 12:30 – 23:00</p>
                <p>Friday: 12:30 – 00:00</p>
                <p>Saturday: 12:30 – 02:00</p>
                <p className="text-terracotta">Tuesday: Closed</p>
              </div>
              
              {/* Address */}
              <div>
                <p className="text-base md:text-lg text-charcoal">
                  Rua da Boavista 66<br />
                  1200-067 Lisboa
                </p>
              </div>
            </div>
            
            {/* CTA */}
            <button
              onClick={handleDirectionsClick}
              className="mt-2 inline-block text-charcoal border-b border-charcoal/50 hover:border-charcoal pb-1 transition-colors"
            >
              Directions →
            </button>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
