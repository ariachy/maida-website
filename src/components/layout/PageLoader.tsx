'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-warm-white flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Arabic Text */}
          <motion.div
            className="font-display text-6xl md:text-8xl text-charcoal/10 mb-8 arabic-text select-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            مائدة
          </motion.div>

          {/* Spinning Logo */}
          <motion.div
            className="relative w-20 h-20 md:w-24 md:h-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Spinning ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-sand border-t-terracotta"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Logo in center - Updated to SVG */}
            <div className="absolute inset-2 flex items-center justify-center">
              <Image
                src="/images/brand/logo.svg"
                alt="maída"
                width={60}
                height={24}
                className="w-12 md:w-14 h-auto"
                priority
              />
            </div>
          </motion.div>

          {/* Subtle tagline */}
          <motion.p
            className="mt-8 text-xs tracking-[0.3em] uppercase text-stone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            The Gathering Table
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
