'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { Locale } from '@/lib/i18n';

interface NavbarProps {
  translations: any;
  locale: Locale;
}

export default function Navbar({ translations, locale }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const nav = translations?.nav || {};
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);
  
  const navLinks = [
    { href: `/${locale}/story`, label: nav.story || 'Story' },
    { href: `/${locale}/menu`, label: nav.menu || 'Menu' },
    { href: `/${locale}/maida-live`, label: 'Maída Live' },
    { href: `/${locale}/blog`, label: nav.blog || 'Blog' },
    { href: `/${locale}/contact`, label: nav.contact || 'Contact' },
  ];
  
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
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-warm-white/95 backdrop-blur-xl ${
          isScrolled
            ? 'shadow-sm py-3 md:py-4'
            : 'py-4 md:py-6'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href={`/${locale}`} className="relative z-10">
            <Image
              src="/images/brand/logo.png"
              alt="maída"
              width={120}
              height={48}
              className={`transition-all duration-500 ${
                isScrolled ? 'h-8 md:h-10' : 'h-10 md:h-12'
              } w-auto`}
              priority
            />
          </Link>
          
          <ul className="hidden md:flex items-center gap-8 lg:gap-12">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative text-sm text-stone hover:text-terracotta transition-colors duration-300 tracking-wide group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-terracotta transition-all duration-400 ease-out group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher locale={locale} />
            <button
              onClick={handleReserveClick}
              className="btn btn-ghost text-sm py-2 px-5"
            >
              {nav.reserve}
            </button>
          </div>
          
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher locale={locale} compact />
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-charcoal"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-charcoal/50 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-warm-white z-50 md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-charcoal"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <nav className="flex-1">
                  <ul className="space-y-6">
                    {navLinks.map((link, index) => (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="font-display text-2xl text-charcoal hover:text-terracotta transition-colors"
                        >
                          {link.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleReserveClick();
                    }}
                    className="btn btn-primary w-full"
                  >
                    {nav.reserve}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
