'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { useUmaiWidget } from '@/components/integrations/UmaiLoader';

interface HeroCTAProps {
  locale: Locale;
}

export default function HeroCTA({ locale }: HeroCTAProps) {
  const { openWidget, isOpening } = useUmaiWidget();
  
  return (
    <motion.div
      className="bg-transparent py-6 md:py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <div className="flex flex-row gap-3 md:gap-4 justify-center px-6">
        <button 
          onClick={openWidget}
          disabled={isOpening}
          className="btn btn-primary text-sm px-5 md:px-6 py-2 md:py-2.5 disabled:opacity-70"
        >
          {isOpening ? 'Loading...' : 'Book a table'}
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
