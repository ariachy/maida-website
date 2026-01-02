'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface VisitProps {
  translations: any;
  locale: string;
}

export default function Visit({ translations, locale }: VisitProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openReservation = () => {
    // Trigger UMAI widget if available
    if (typeof window !== 'undefined' && (window as any).UMAIWidget) {
      (window as any).UMAIWidget.open();
    }
  };

  return (
    <section className="py-20 md:py-28 bg-sand/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-terracotta mb-4">
            Find Us
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-charcoal">
            Your table in Cais do Sodré
          </h2>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Left Column - Info */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Address */}
            <div>
              <h3 className="font-display text-xl text-charcoal mb-3">Location</h3>
              <p className="text-stone leading-relaxed">
                Rua da Boavista 66<br />
                Cais do Sodré, Lisboa<br />
                1200-066 Portugal
              </p>
            </div>

            {/* Hours */}
            <div>
              <h3 className="font-display text-xl text-charcoal mb-3">Hours</h3>
              <div className="space-y-2 text-stone">
                <div className="flex justify-between max-w-xs">
                  <span>Mon, Wed - Thu, Sun</span>
                  <span>12:30 - 23:00</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span>Friday</span>
                  <span>12:30 - 00:00</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span>Saturday</span>
                  <span>12:30 - 00:00+</span>
                </div>
                <div className="flex justify-between max-w-xs text-terracotta">
                  <span>Tuesday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            {/* Getting Here */}
            <div>
              <h3 className="font-display text-xl text-charcoal mb-3">Getting Here</h3>
              <ul className="space-y-2 text-stone">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>3 min from Cais do Sodré metro</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>5 min from Time Out Market</span>
                </li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="https://maps.google.com/?q=Rua+da+Boavista+66+Lisboa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-charcoal text-charcoal rounded-full font-medium hover:bg-charcoal hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Get Directions
              </a>
              <button
                onClick={openReservation}
                className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-full font-medium hover:bg-terracotta/90 transition-colors"
              >
                Reserve a Table
              </button>
            </div>
          </motion.div>

          {/* Right Column - Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-stone/10">
              {/* Google Maps Embed - only render on client */}
              {mounted && (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.9!2d-9.1448!3d38.7068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19347fdf6d3c9b%3A0x0!2sRua%20da%20Boavista%2066%2C%20Lisboa!5e0!3m2!1sen!2spt!4v1704067200000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                  title="Maída Location"
                />
              )}
              
              {/* Fallback/Overlay with address */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">maída</p>
                    <p className="text-sm text-stone">Rua da Boavista 66, Cais do Sodré</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
