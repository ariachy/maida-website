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
  const menuRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  const { menu } = translations;
  const { categories, items } = menuData;
  
  // Sort categories by sortOrder
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Handle category click with scroll
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Scroll to menu section smoothly
    if (menuRef.current) {
      const offset = 100; // Account for sticky header/buttons
      const elementPosition = menuRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
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
    <div className="min-h-screen bg-warm-white">
      {/* ============================================
          HEADER SECTION (replaces hero)
          ============================================ */}
      <section className="pt-28 md:pt-32 pb-6 md:pb-8 px-6 bg-warm-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="text-xs tracking-[0.3em] uppercase text-terracotta mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
          </motion.p>

          <motion.h1 
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {menu.heroTitle || 'Our Menu'}
          </motion.h1>

          <motion.p
            className="text-stone text-base md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Mediterranean flavour, Lebanese soul.
          </motion.p>
        </div>
      </section>

      {/* ============================================
          DIVIDER WITH ARABIC WATERMARK
          ============================================ */}
      <div className="relative flex items-center justify-center gap-4 px-6 pb-4 overflow-hidden">
        {/* Arabic text as subtle background */}
        <span className="absolute text-6xl text-terracotta/[0.06] font-display select-none pointer-events-none" style={{ fontFamily: 'serif' }}>
          مائدة
        </span>
        <span className="relative w-16 md:w-24 h-px bg-terracotta/30" />
        <Image 
          src="/images/brand/emblem.svg" 
          alt="" 
          width={20} 
          height={20} 
          className="relative opacity-50"
        />
        <span className="relative w-16 md:w-24 h-px bg-terracotta/30" />
      </div>

      {/* ============================================
          CATEGORY BUTTONS - Centered, scroll only if needed
          ============================================ */}
      <div className="relative py-5 md:py-6 px-4 bg-sand/30">
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
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-terracotta text-warm-white'
                      : 'bg-sand text-charcoal hover:bg-terracotta/10 hover:text-terracotta'
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
          MENU ITEMS - Paper-like background with Arabic watermark
          ============================================ */}
      <div className="py-6 md:py-10 px-4 bg-sand/30">
        <div className="max-w-3xl mx-auto">
          {/* Menu Container - Paper style */}
          <div 
            ref={menuRef}
            className="relative border border-stone/10 shadow-lg overflow-hidden"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Paper texture - subtle fiber pattern */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.4]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E")`,
              }}
            />
            
            {/* Subtle edge darkening for depth */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 60px rgba(0,0,0,0.03)',
              }}
            />
            
            {/* Decorative corner accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-terracotta/20 pointer-events-none" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-terracotta/20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-terracotta/20 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-terracotta/20 pointer-events-none" />
            
            {/* Arabic Watermark - centered */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
            >
              <span 
                className="text-[180px] md:text-[250px] text-terracotta/[0.06] font-display"
                style={{ fontFamily: 'serif' }}
              >
                مائدة
              </span>
            </div>

            {/* Content */}
            <div className="relative px-8 md:px-12 py-10 md:py-12">
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
