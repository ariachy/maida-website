'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface HeroCTAProps {
  locale: Locale;
}

export default function HeroCTA({ locale }: HeroCTAProps) {
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
    <motion.div
      className="bg-transparent py-6 md:py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <div className="flex flex-row gap-3 md:gap-4 justify-center px-6">
        <button 
          onClick={handleReserveClick} 
          className="btn btn-primary text-sm px-5 md:px-6 py-2 md:py-2.5"
        >
          Book a table
        </button>
        <Link 
          href={`/${locale}/menu`} 
          className="btn btn-ghost text-sm px-5 md:px-6 py-2 md:py-2.5"
        >
          Menu
        </Link>
      </div>
    </motion.div>
  );
}
