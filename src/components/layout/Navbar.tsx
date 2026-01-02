'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { Locale } from '@/lib/i18n';

interface NavbarProps {
  translations: any;
  locale: Locale;
}

export default function Navbar({ translations, locale }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [isMobileDiscoverOpen, setIsMobileDiscoverOpen] = useState(false);
  const discoverRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  
  const nav = translations?.nav || {};
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) {
        setIsDiscoverOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsDiscoverOpen(false);
      }
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
  
  // Main navigation links
  const navLinks = [
    { href: `/${locale}/story`, label: nav.story || 'Story', segment: 'story' },
    { href: `/${locale}/menu`, label: nav.menu || 'Menu', segment: 'menu' },
    { href: `/${locale}/maida-live`, label: 'Maída Live', segment: 'maida-live' },
    { href: `/${locale}/contact`, label: nav.contact || 'Contact', segment: 'contact' },
  ];
  
  // Discover dropdown items
  const discoverLinks = [
    { href: `/${locale}/maida-saj`, label: 'Maída SAJ', segment: 'maida-saj' },
    { href: `/${locale}/coffee-tea`, label: 'Coffee & Tea', segment: 'coffee-tea' },
    { href: `/${locale}/blog`, label: 'Blog', segment: 'blog' },
  ];
  
  // Check if current path matches the link
  const isActiveLink = (segment: string) => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const currentSegment = pathSegments[1] || '';
    return currentSegment === segment;
  };
  
  // Check if any Discover sub-item is active
  const isDiscoverActive = discoverLinks.some(link => isActiveLink(link.segment));
  
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-warm-white/95 backdrop-blur-xl py-3 md:py-4 ${
          isScrolled ? 'shadow-sm' : ''
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
              width={140}
              height={56}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>
          
          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8 lg:gap-12">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.segment);
              
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative text-base lg:text-lg transition-colors duration-300 tracking-wide group ${
                      isActive
                        ? 'text-terracotta'
                        : 'text-stone hover:text-terracotta'
                    }`}
                  >
                    {link.label}
                    <span 
                      className={`absolute -bottom-1 left-0 h-px bg-terracotta transition-all duration-400 ease-out ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`} 
                    />
                  </Link>
                </li>
              );
            })}
            
            {/* Discover Dropdown */}
            <li 
              ref={discoverRef}
              className="relative"
              onMouseEnter={() => setIsDiscoverOpen(true)}
              onMouseLeave={() => setIsDiscoverOpen(false)}
            >
              <button
                onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}
                className={`flex items-center gap-1 text-base lg:text-lg transition-colors duration-300 tracking-wide ${
                  isDiscoverActive ? 'text-terracotta' : 'text-stone hover:text-terracotta'
                }`}
              >
                Discover
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDiscoverOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDiscoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                  >
                    <div className="bg-warm-white shadow-lg border border-sand/50 py-2 min-w-[180px]">
                      {discoverLinks.map((link) => {
                        const isActive = isActiveLink(link.segment);
                        
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsDiscoverOpen(false)}
                            className={`block px-5 py-2.5 text-sm transition-colors ${
                              isActive 
                                ? 'text-terracotta bg-sand/30' 
                                : 'text-stone hover:text-terracotta hover:bg-sand/20'
                            }`}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>
          
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher locale={locale} />
            <button
              onClick={handleReserveClick}
              className="btn btn-ghost text-sm py-2 px-5"
            >
              {nav.reserve || 'Reserve a Table'}
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
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-charcoal/50 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-warm-white z-50 md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex flex-col h-full p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-charcoal"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Mobile Nav Links */}
                <nav className="flex-1">
                  <ul className="space-y-6">
                    {navLinks.map((link, index) => {
                      const isActive = isActiveLink(link.segment);
                      
                      return (
                        <motion.li
                          key={link.href}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`font-display text-2xl transition-colors ${
                              isActive
                                ? 'text-terracotta'
                                : 'text-charcoal hover:text-terracotta'
                            }`}
                          >
                            {link.label}
                          </Link>
                        </motion.li>
                      );
                    })}
                    
                    {/* Mobile Discover Section */}
                    <motion.li
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.1 }}
                    >
                      <button
                        onClick={() => setIsMobileDiscoverOpen(!isMobileDiscoverOpen)}
                        className={`flex items-center gap-2 font-display text-2xl transition-colors ${
                          isDiscoverActive ? 'text-terracotta' : 'text-charcoal'
                        }`}
                      >
                        Discover
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isMobileDiscoverOpen ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      
                      {/* Mobile Discover Submenu */}
                      <AnimatePresence>
                        {isMobileDiscoverOpen && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 ml-4 space-y-3 overflow-hidden"
                          >
                            {discoverLinks.map((link) => {
                              const isActive = isActiveLink(link.segment);
                              
                              return (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block text-lg transition-colors ${
                                      isActive 
                                        ? 'text-terracotta' 
                                        : 'text-stone hover:text-terracotta'
                                    }`}
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  </ul>
                </nav>
                
                {/* Reserve Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleReserveClick();
                    }}
                    className="btn btn-primary w-full"
                  >
                    {nav.reserve || 'Reserve a Table'}
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