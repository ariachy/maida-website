'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Clock, Phone } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface VisitProps {
  translations: any;
  locale: Locale;
}

export default function Visit({ translations, locale }: VisitProps) {
  const visit = translations?.visit || {};
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

  const handleDirectionsClick = () => {
    window.open('https://maps.google.com/?q=Rua+da+Boavista+66+Lisboa', '_blank');
  };
  
  return (
    <section 
      ref={ref}
      className="pt-8 md:pt-12 pb-20 md:pb-28 px-6 bg-cream"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-terracotta mb-3">
            {visit.label || 'Find us'}
          </p>
          <h2 className="font-display text-fluid-3xl font-medium text-charcoal">
            {visit.title || 'Your table in Cais do Sodré'}
          </h2>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Address */}
            <div className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-charcoal mb-1">
                  {visit.address || 'Address'}
                </h3>
                <p className="text-stone">
                  Rua da Boavista 66<br />
                  1200-067 Lisboa
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-charcoal mb-1">
                  {visit.hours || 'Opening Hours'}
                </h3>
                <div className="text-stone text-sm space-y-1">
                  <p>Mon, Wed, Thu, Sun: 12:30 - 23:00</p>
                  <p>Friday: 12:30 - 00:00</p>
                  <p>Saturday: 12:30 - 02:00</p>
                  <p className="text-terracotta">Tuesday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-charcoal mb-1">
                  {visit.contact || 'Contact'}
                </h3>
                <p className="text-stone">
                  <a href="mailto:info@maida.pt" className="hover:text-terracotta transition-colors">
                    info@maida.pt
                  </a>
                </p>
              </div>
            </div>

            {/* CTA Button - UPDATED: "Book a table" */}
            <button
              onClick={handleDirectionsClick}
              className="btn btn-ghost"
            >
              Get Directions
            </button>
          </motion.div>

          {/* Right: Map */}
          <motion.div
            className="relative aspect-[4/3] bg-sand overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
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
        </div>
      </div>
    </section>
  );
}
