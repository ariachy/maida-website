'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Locale } from '@/lib/i18n';

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
        
        {/* Left - Map */}
        <motion.div
          className="relative h-[280px] md:h-auto order-2 md:order-1"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.4832823894246!2d-9.146714684660947!3d38.70643397960015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19347f1d66d0e7%3A0x5e9e5e5e5e5e5e5e!2sRua%20da%20Boavista%2066%2C%20Lisboa!5e0!3m2!1sen!2spt!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Maída Location"
            className="absolute inset-0"
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
                <p className="text-terracotta">Mon–Tue: Closed</p>
                <p>Wed, Thu, Sun: 12:30 – 23:00 <span className="text-charcoal/50 text-xs">(Kitchen 22:30)</span></p>
                <p>Fri–Sat: 12:30 – 01:00 <span className="text-charcoal/50 text-xs">(Kitchen 23:30)</span></p>
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
