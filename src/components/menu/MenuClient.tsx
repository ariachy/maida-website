'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import MenuItem from '@/components/ui/MenuItem';

interface MenuClientProps {
  translations: any;
  menuData: {
    categories: Array<{
      id: string;
      slug: string;
      image: string;
      sortOrder: number;
    }>;
    items: Array<{
      id: string;
      categoryId: string;
      price: number;
      priceBottle?: number;
      image: string | null;
      tags: string[];
      sortOrder: number;
    }>;
  };
  locale: string;
}

export default function MenuClient({ translations, menuData, locale }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState(menuData.categories[0]?.id || '');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  const { menu } = translations;
  const { categories, items } = menuData;
  
  // Sort categories by sortOrder
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Get items for active category
  const activeItems = items
    .filter((item) => item.categoryId === activeCategory)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Check if scrolling is needed and update arrows
  const updateScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const hasOverflow = scrollWidth > clientWidth + 10;
      setNeedsScroll(hasOverflow);
      setShowLeftArrow(hasOverflow && scrollLeft > 10);
      setShowRightArrow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      updateScrollState();
      
      // Also check on resize
      window.addEventListener('resize', updateScrollState);
      return () => {
        container.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
      };
    }
  }, []);
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="min-h-screen bg-cream">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/atmosphere/facade-night.webp"
            alt="Maída Restaurant"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          {/* Tagline */}
          <motion.p
            className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-sand mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-sand" />
            {menu.heroTagline || 'Made for sharing'}
            <span className="w-8 h-px bg-sand" />
          </motion.p>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                {menu.heroTitle || 'Our Menu'}
              </motion.span>
            </span>
          </h1>
        </div>
      </section>

      {/* ============================================
          CATEGORY BUTTONS - Centered, scroll only if needed
          ============================================ */}
      <div className="relative py-6 md:py-8 px-4 bg-cream">
        <div className="max-w-4xl mx-auto relative">
          {/* Left Arrow - only show if scrolling needed */}
          <AnimatePresence>
            {showLeftArrow && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-warm-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-warm-white transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Category Buttons Container */}
          <div
            ref={scrollContainerRef}
            className={`flex gap-2 md:gap-3 py-2 ${
              needsScroll 
                ? 'overflow-x-auto scrollbar-hide scroll-smooth-x px-8' 
                : 'overflow-visible flex-wrap justify-center'
            }`}
          >
            {sortedCategories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-terracotta text-warm-white'
                      : 'bg-sand/50 text-charcoal hover:bg-sand hover:text-terracotta'
                  }`}
                >
                  {menu.categories[category.id]?.name || category.id}
                </button>
              );
            })}
          </div>
          
          {/* Right Arrow - only show if scrolling needed */}
          <AnimatePresence>
            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-warm-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-warm-white transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* ============================================
          MENU ITEMS - With decorative border
          ============================================ */}
      <div className="py-10 md:py-14 px-4 bg-cream">
        <div className="max-w-3xl mx-auto">
          {/* Decorative Border Container */}
          <div className="relative">
            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-terracotta" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-r-2 border-t-2 border-terracotta" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-2 border-b-2 border-terracotta" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-terracotta" />
            
            {/* Decorative dots along edges */}
            <div className="absolute top-0 left-1/4 w-1.5 h-1.5 bg-terracotta rounded-full -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-terracotta rounded-full -translate-y-1/2" />
            <div className="absolute top-0 left-3/4 w-1.5 h-1.5 bg-terracotta rounded-full -translate-y-1/2" />
            <div className="absolute bottom-0 left-1/4 w-1.5 h-1.5 bg-terracotta rounded-full translate-y-1/2" />
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-terracotta rounded-full translate-y-1/2" />
            <div className="absolute bottom-0 left-3/4 w-1.5 h-1.5 bg-terracotta rounded-full translate-y-1/2" />

            {/* Content inside border */}
            <div className="px-5 md:px-8 py-8 md:py-10 border border-sand bg-warm-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Category Header with emblem underline */}
                  <div className="text-center mb-8">
                    <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-3">
                      {menu.categories[activeCategory]?.name}
                    </h2>
                    {/* Decorative underline with emblem */}
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-px bg-terracotta" />
                      <Image 
                        src="/images/brand/emblem.svg" 
                        alt="" 
                        width={16} 
                        height={16} 
                        className="opacity-70"
                      />
                      <div className="w-10 h-px bg-terracotta" />
                    </div>
                  </div>
                  
                  {/* Items Grid - 2 columns on desktop, tighter gap */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-8">
                    {activeItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <MenuItem
                          name={menu.items[item.id]?.name || item.id}
                          description={menu.items[item.id]?.description || ''}
                          price={item.price}
                          priceBottle={item.priceBottle}
                          tags={item.tags}
                          tagLabels={menu.tags}
                          glassLabel={menu.glass}
                          bottleLabel={menu.bottle}
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Empty state */}
                  {activeItems.length === 0 && (
                    <p className="text-center text-stone py-12">
                      {menu.emptyCategory || 'No items in this category yet.'}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Allergens Legend */}
              <div className="mt-8 pt-6 border-t border-sand/50">
                <p className="text-center text-stone text-xs">
                  <span className="inline-flex items-center gap-3 flex-wrap justify-center">
                    <span><span className="inline-block px-1 py-0.5 bg-sage/20 text-sage text-[9px] font-medium mr-1">V</span> {menu.legend?.vegetarian || 'Vegetarian'}</span>
                    <span className="text-sand">·</span>
                    <span><span className="inline-block px-1 py-0.5 bg-sage/20 text-sage text-[9px] font-medium mr-1">VG</span> {menu.legend?.vegan || 'Vegan'}</span>
                    <span className="text-sand">·</span>
                    <span><span className="inline-block px-1 py-0.5 bg-sage/20 text-sage text-[9px] font-medium mr-1">GF</span> {menu.legend?.glutenFree || 'Gluten-Free'}</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-stone text-xs mt-6">
            {menu.disclaimer || 'Prices in Euros. Prices include VAT.'}
          </p>
        </div>
      </div>
    </div>
  );
}
