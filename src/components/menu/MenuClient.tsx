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
  
  // Handle URL hash or query param for deep linking
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category') || hash;
    
    if (categoryParam) {
      const category = categories.find(c => c.slug === categoryParam);
      if (category) {
        setActiveCategory(category.id);
      }
    }
  }, [categories]);
  
  // Get items for a specific category
  const getItemsForCategory = (categoryId: string) => {
    return items
      .filter((item) => item.categoryId === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };
  
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
      <section className="relative min-h-0 md:min-h-[70vh] flex items-center justify-center overflow-hidden pt-32 pb-20 md:py-0">
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
            className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-sand mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-sand" />
            {menu.heroTagline || 'Made for sharing'}
            <span className="w-8 h-px bg-sand" />
          </motion.p>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-7xl lg:text-8xl font-light text-white mb-4 md:mb-6">
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

          {/* Empty subtitle for consistent hero height */}
          <motion.p
            className="text-base md:text-xl text-transparent max-w-2xl mx-auto font-light leading-relaxed select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            aria-hidden="true"
          >
            A place where flavors, music, and good company come together.
            <br className="hidden md:block" />
            Rooted in tradition, reimagined for today.
          </motion.p>
        </div>
      </section>

      {/* ============================================
          CATEGORY BUTTONS - Centered, scroll only if needed
          ============================================ */}
      <div className="relative py-5 md:py-6 px-4 bg-cream">
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
          MENU ITEMS - Paper-like background, clean border
          ============================================ */}
      <div className="py-4 md:py-6 px-4 bg-cream">
        <div className="max-w-3xl mx-auto">
          {/* Menu Container - Paper style */}
          <div 
            className="relative border border-terracotta/30 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #FDFBF7 0%, #FAF8F4 50%, #F8F6F1 100%)',
            }}
          >
            {/* Subtle inner shadow for paper depth */}
            <div className="absolute inset-0 pointer-events-none shadow-inner opacity-30" />

            {/* Content */}
            <div className="relative px-6 md:px-10 py-8 md:py-10">
              {/* Render ALL categories for SEO - only show active one */}
              {sortedCategories.map((category) => {
                const categoryItems = getItemsForCategory(category.id);
                const isActive = activeCategory === category.id;
                
                return (
                  <div
                    key={category.id}
                    className={isActive ? 'block' : 'hidden'}
                    aria-hidden={!isActive}
                  >
                    {/* Category Header with emblem underline - properly centered */}
                    <div className="text-center mb-8">
                      <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-4">
                        {menu.categories[category.id]?.name}
                      </h2>
                      {/* Decorative underline with emblem - using flex for perfect centering */}
                      <div className="flex items-center justify-center">
                        <div className="w-12 h-px bg-terracotta/60" />
                        <div className="mx-3">
                          <Image 
                            src="/images/brand/emblem.svg" 
                            alt="" 
                            width={14} 
                            height={14} 
                            className="opacity-60"
                          />
                        </div>
                        <div className="w-12 h-px bg-terracotta/60" />
                      </div>
                    </div>
                    
                    {/* Items Grid - 2 columns on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12">
                      {categoryItems.map((item, index) => (
                        <div key={item.id}>
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
                        </div>
                      ))}
                    </div>
                    
                    {/* Empty state */}
                    {categoryItems.length === 0 && (
                      <p className="text-center text-stone py-12">
                        {menu.emptyCategory || 'No items in this category yet.'}
                      </p>
                    )}
                  </div>
                );
              })}
              
              {/* Allergens Legend */}
              <div className="mt-8 pt-6 border-t border-stone/20">
                <p className="text-center text-stone text-xs">
                  <span className="inline-flex items-center gap-3 flex-wrap justify-center">
                    <span><span className="inline-block px-1 py-0.5 bg-sage/20 text-sage text-[9px] font-medium mr-1">V</span> {menu.legend?.vegetarian || 'Vegetarian'}</span>
                    <span className="text-stone/40">·</span>
                    <span><span className="inline-block px-1 py-0.5 bg-sage/20 text-sage text-[9px] font-medium mr-1">VG</span> {menu.legend?.vegan || 'Vegan'}</span>
                    <span className="text-stone/40">·</span>
                    <span><span className="inline-block px-1 py-0.5 bg-sage/20 text-sage text-[9px] font-medium mr-1">GF</span> {menu.legend?.glutenFree || 'Gluten-Free'}</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-stone text-xs mt-5">
            {menu.disclaimer || 'Prices in Euros. Prices include VAT.'}
          </p>
        </div>
      </div>
    </div>
  );
}
