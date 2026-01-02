'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // When pathname or search params change, navigation is complete
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Listen for clicks on links to show loading state immediately
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const href = link.getAttribute('href');
        // Only show loader for internal navigation (not external links or anchors)
        if (href && href.startsWith('/') && !href.startsWith('/#')) {
          // Don't show if it's the same page
          if (href !== pathname) {
            setIsNavigating(true);
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <>
          {/* Progress bar at top */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-terracotta z-[9999] origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.9 }}
            exit={{ scaleX: 1, opacity: 0 }}
            transition={{ 
              scaleX: { duration: 2, ease: 'easeOut' },
              opacity: { duration: 0.3, delay: 0.1 }
            }}
          />
          
          {/* Optional: Subtle overlay to indicate loading */}
          <motion.div
            className="fixed inset-0 bg-warm-white/30 backdrop-blur-[1px] z-[9998] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
