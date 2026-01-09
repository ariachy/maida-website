'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';

// Variation configurations
const variations = [
  {
    id: 'light',
    background: 'bg-[#FCF8ED]',
    image: '/images/404/table-setup.webp',
    number404Color: 'text-sage/10',
    title: "Oops! This page wandered off",
    subtitle: "Maybe it went to grab more hummus.",
    description: "Let's get you back to Maída.",
    titleColor: 'text-charcoal',
    subtitleColor: 'text-stone',
    descriptionColor: 'text-stone/70',
    primaryBtnClass: 'bg-terracotta text-warm-white hover:bg-terracotta/90',
    ghostBtnClass: 'border border-charcoal/30 text-charcoal hover:bg-charcoal/5',
    tagline: '"The best meals are the ones you almost missed"',
    taglineColor: 'text-stone/50',
  },
  {
    id: 'dark',
    background: 'bg-[#39431D]',
    image: '/images/404/a-taste-of-tradition.webp',
    number404Color: 'text-warm-white/10',
    title: "This page doesn't exist",
    subtitle: "But ours does.",
    description: "Looks like you've wandered off the menu.",
    titleColor: 'text-warm-white',
    subtitleColor: 'text-warm-white/70',
    descriptionColor: 'text-warm-white/50',
    primaryBtnClass: 'bg-terracotta text-warm-white hover:bg-terracotta/90',
    ghostBtnClass: 'border border-warm-white/30 text-warm-white hover:bg-warm-white/10',
    tagline: '"A taste of tradition, a vibe of today"',
    taglineColor: 'text-warm-white/40',
  },
];

export default function NotFound() {
  const [variation, setVariation] = useState(variations[0]);

  useEffect(() => {
    // Randomly select a variation on mount
    const randomIndex = Math.floor(Math.random() * variations.length);
    setVariation(variations[randomIndex]);
    
    // Set fun page title
    document.title = "404 | This page went to grab more hummus | Maída";
  }, []);

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
    <div className={`min-h-screen ${variation.background} flex flex-col items-center justify-center px-6 py-20 overflow-hidden`}>
      {/* Background pattern - subtle */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url('/images/brand/emblem.svg')`,
          backgroundSize: '80px',
          backgroundRepeat: 'repeat',
        }}
      />
      
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <motion.p
          className={`text-[6rem] md:text-[10rem] font-display ${variation.number404Color} leading-none select-none`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          
        </motion.p>
        
        {/* Illustration */}
        <motion.div
          className="relative -mt-12 md:-mt-20 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Image
            src={variation.image}
            alt="Maída table illustration"
            width={350}
            height={280}
            className="mx-auto"
          />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1 className={`font-display text-2xl md:text-4xl ${variation.titleColor} mb-3`}>
            {variation.title}
          </h1>
          <p className={`text-lg md:text-xl ${variation.subtitleColor} mb-2`}>
            {variation.subtitle}
          </p>
          <p className={`${variation.descriptionColor} mb-8`}>
            {variation.description}
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link 
            href="/en" 
            className={`${variation.primaryBtnClass} px-6 py-3 text-base font-medium transition-colors`}
          >
            Back to home
          </Link>
          <Link 
            href="/en/menu" 
            className={`${variation.ghostBtnClass} px-6 py-3 text-base font-medium transition-colors`}
          >
            View Menu
          </Link>
          <button 
            onClick={handleReserveClick}
            className={`${variation.ghostBtnClass} px-6 py-3 text-base font-medium transition-colors`}
          >
            Reserve a table
          </button>
        </motion.div>

        {/* Fun tagline */}
        <motion.p
          className={`mt-10 text-sm ${variation.taglineColor} italic`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {variation.tagline}
        </motion.p>
      </div>

      {/* UMAI Widget Script - needed since 404 is outside [lang] layout */}
      <Script
        src="https://widget.letsumai.com/dist/embed.min.js"
        data-api-key="d541f212-d5ca-4839-ab2b-7f9c99e1c96c"
        data-widget-type="reservation"
        strategy="lazyOnload"
      />
    </div>
  );
}
