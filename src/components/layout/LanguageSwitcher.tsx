'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { Locale, locales, languageNames, languageFlags, addLocaleToPathname, removeLocaleFromPathname } from '@/lib/i18n';

interface LanguageSwitcherProps {
  locale: Locale;
  compact?: boolean;
}

export default function LanguageSwitcher({ locale, compact = false }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  const getLocalePath = (targetLocale: Locale) => {
    const cleanPath = removeLocaleFromPathname(pathname);
    return addLocaleToPathname(cleanPath, targetLocale);
  };
  
  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 p-2 text-charcoal hover:text-terracotta transition-colors"
          aria-label="Change language"
        >
          <Globe className="w-5 h-5" />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 bg-warm-white rounded-lg shadow-lg border border-sand overflow-hidden min-w-[140px]"
            >
              {locales.map((loc) => (
                <Link
                  key={loc}
                  href={getLocalePath(loc)}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    loc === locale
                      ? 'bg-cream text-terracotta'
                      : 'text-charcoal hover:bg-cream/50'
                  }`}
                >
                  <span>{languageFlags[loc]}</span>
                  <span>{languageNames[loc]}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-stone hover:text-charcoal transition-colors rounded-lg hover:bg-cream/50"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase">{locale}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 bg-warm-white rounded-lg shadow-lg border border-sand overflow-hidden min-w-[160px]"
          >
            {locales.map((loc) => (
              <Link
                key={loc}
                href={getLocalePath(loc)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  loc === locale
                    ? 'bg-cream text-terracotta font-medium'
                    : 'text-charcoal hover:bg-cream/50'
                }`}
              >
                <span>{languageFlags[loc]}</span>
                <span>{languageNames[loc]}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
