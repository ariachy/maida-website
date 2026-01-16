'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface MenuItem {
  id: string;
  categoryId: string;
  sortOrder: number;
}

interface MenuClientProps {
  translations: any;
  menuData: {
    categories: Array<{
      id: string;
      slug: string;
      image: string;
      sortOrder: number;
    }>;
    items: Array<MenuItem>;
  };
  locale: string;
}

// Define sub-categories with their sortOrder ranges
const subCategories: Record<string, Array<{ id: string; name: string; minOrder: number; maxOrder: number }>> = {
  'to-start': [
    { id: 'starters', name: 'Starters', minOrder: 1, maxOrder: 9 },
    { id: 'dips', name: 'Dips', minOrder: 10, maxOrder: 19 },
    { id: 'salads', name: 'Salads', minOrder: 30, maxOrder: 39 },
  ],
  'saj-wraps': [
    { id: 'savoury', name: 'Savoury', minOrder: 1, maxOrder: 9 },
    { id: 'sweet', name: 'Sweet', minOrder: 10, maxOrder: 19 },
  ],
  'drinks': [
    { id: 'coffee', name: 'Coffee', minOrder: 1, maxOrder: 19 },
    { id: 'tea', name: 'Tea', minOrder: 20, maxOrder: 29 },
    { id: 'lemonade', name: 'Lemonade', minOrder: 30, maxOrder: 34 },
    { id: 'juices', name: 'Juices', minOrder: 35, maxOrder: 39 },
    { id: 'milkshakes', name: 'Milkshakes', minOrder: 40, maxOrder: 49 },
    { id: 'soft-drinks', name: 'Soft Drinks', minOrder: 50, maxOrder: 69 },
    { id: 'mocktails', name: 'Mocktails', minOrder: 70, maxOrder: 79 },
  ],
  'cocktails-wine': [
    { id: 'signatures', name: "Maída's Signatures", minOrder: 1, maxOrder: 19 },
    { id: 'classics', name: 'Classics', minOrder: 20, maxOrder: 39 },
    { id: 'wines', name: 'Wines', minOrder: 40, maxOrder: 49 },
    { id: 'beers', name: 'Beers', minOrder: 50, maxOrder: 59 },
  ],
};

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
  
  // Handle category click - just switch category, no scroll
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
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
  
  // Get items for a sub-category
  const getItemsForSubCategory = (categoryId: string, minOrder: number, maxOrder: number) => {
    return items
      .filter((item) => item.categoryId === categoryId && item.sortOrder >= minOrder && item.sortOrder <= maxOrder)
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

  // Render items grid - compact mode for simple items like drinks
  const renderItems = (itemsList: MenuItem[], compact: boolean = false) => {
    if (compact) {
      // Single column, minimal spacing for drinks/simple items
      return (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
          {itemsList.map((item, index) => {
            const itemTranslation = menu?.items?.[item.id];
            const itemName = itemTranslation?.name || item.id.replace(/-/g, ' ');
            const itemDescription = itemTranslation?.description || '';
            
            return (
              <span key={item.id} className="text-charcoal text-sm capitalize py-1">
                {itemName}
                {itemDescription && (
                  <span className="text-stone text-xs ml-1">({itemDescription})</span>
                )}
              </span>
            );
          })}
        </div>
      );
    }
    
    // Regular 2-column grid
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-4">
        {itemsList.map((item) => {
          const itemTranslation = menu?.items?.[item.id];
          const itemName = itemTranslation?.name || item.id.replace(/-/g, ' ');
          const itemDescription = itemTranslation?.description || '';
          
          return (
            <div key={item.id} className="py-2">
              <h3 className="font-display text-base md:text-lg text-charcoal font-medium capitalize">
                {itemName}
              </h3>
              {itemDescription && (
                <p className="text-stone text-sm mt-1 leading-relaxed">
                  {itemDescription}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Couvert box - special styling
  const renderCouvertBox = (categoryId: string) => {
    const couvertItems = getItemsForSubCategory(categoryId, 20, 29);
    if (couvertItems.length === 0) return null;
    
    const couvertName = menu?.subCategories?.couvert || 'Couvert';
    
    return (
      <div className="relative mb-12 mt-2">
        {/* Couvert label centered above the box */}
        <div className="text-center mb-3">
          <span className="text-xs uppercase tracking-[0.25em] text-terracotta/70 font-medium">
            {couvertName}
          </span>
        </div>
        
        {/* Transparent box with border */}
        <div className="border border-terracotta/25 px-6 py-5">
          {/* Couvert items in a row with more spacing */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {couvertItems.map((item, index) => {
              const itemTranslation = menu?.items?.[item.id];
              const itemName = itemTranslation?.name || item.id.replace(/-/g, ' ');
              
              return (
                <span key={item.id} className="text-charcoal text-sm capitalize flex items-center">
                  {index > 0 && <span className="text-terracotta/40 mr-8">·</span>}
                  {itemName}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render sub-category section
  const renderSubCategory = (subCat: { id: string; name: string; minOrder: number; maxOrder: number }, categoryId: string, isFirst: boolean) => {
    const subCatItems = getItemsForSubCategory(categoryId, subCat.minOrder, subCat.maxOrder);
    if (subCatItems.length === 0) return null;
    
    // Get translated sub-category name if available
    const subCatName = menu?.subCategories?.[subCat.id] || subCat.name;
    
    // Use compact mode for drinks category
    const isCompact = categoryId === 'drinks';
    
    return (
      <div key={subCat.id} className={isFirst ? '' : isCompact ? 'mt-6' : 'mt-10'}>
        <h3 className="text-center text-sm uppercase tracking-[0.2em] text-terracotta/80 mb-4">
          {subCatName}
        </h3>
        {renderItems(subCatItems, isCompact)}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-warm-white">
      {/* ============================================
          HEADER SECTION
          ============================================ */}
      <section className="pt-28 md:pt-32 pb-6 md:pb-8 px-6 bg-warm-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {menu?.heroTitle || 'Our Menu'}
          </motion.h1>

          <motion.p
            className="text-stone text-base md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {menu?.heroSubtitle || 'Mediterranean flavours. Lebanese soul.'}
          </motion.p>
        </div>
      </section>

      {/* ============================================
          DIVIDER WITH ARABIC WATERMARK
          ============================================ */}
      <div className="relative flex items-center justify-center gap-4 px-6 pb-4 overflow-hidden">
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
          CATEGORY BUTTONS
          ============================================ */}
      <div className="relative py-5 md:py-6 px-4 bg-sand/30">
        <div className="max-w-4xl mx-auto relative">
          {/* Left Arrow */}
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
              const categoryName = menu?.categories?.[category.id]?.name || category.id;
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
                  {categoryName}
                </button>
              );
            })}
          </div>
          
          {/* Right Arrow */}
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
          MENU ITEMS
          ============================================ */}
      <div className="py-6 md:py-10 px-4 bg-sand/30">
        <div className="max-w-3xl mx-auto">
          {/* Menu Container - Paper style */}
          <div 
            className="relative border border-stone/10 shadow-lg overflow-hidden"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Paper texture */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.4]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E")`,
              }}
            />
            
            {/* Edge darkening */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 60px rgba(0,0,0,0.03)',
              }}
            />
            
            {/* Corner accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-terracotta/20 pointer-events-none" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-terracotta/20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-terracotta/20 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-terracotta/20 pointer-events-none" />
            
            {/* Arabic Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span 
                className="text-[180px] md:text-[250px] text-terracotta/[0.06] font-display"
                style={{ fontFamily: 'serif' }}
              >
                مائدة
              </span>
            </div>

            {/* Content */}
            <div className="relative px-8 md:px-12 py-10 md:py-12">
              {sortedCategories.map((category) => {
                const categoryItems = getItemsForCategory(category.id);
                const isActive = activeCategory === category.id;
                const categoryName = menu?.categories?.[category.id]?.name || category.id;
                const hasSubCategories = subCategories[category.id];
                
                return (
                  <div
                    key={category.id}
                    className={isActive ? 'block' : 'hidden'}
                    aria-hidden={!isActive}
                  >
                    {/* Category Header */}
                    <div className="text-center mb-8">
                      <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-4">
                        {categoryName}
                      </h2>
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
                    
                    {/* Render Couvert box at top for to-start category */}
                    {category.id === 'to-start' && renderCouvertBox(category.id)}
                    
                    {/* Render with sub-categories if available, otherwise flat list */}
                    {hasSubCategories ? (
                      hasSubCategories.map((subCat, index) => 
                        renderSubCategory(subCat, category.id, index === 0)
                      )
                    ) : (
                      renderItems(categoryItems)
                    )}
                    
                    {/* Empty state */}
                    {categoryItems.length === 0 && (
                      <p className="text-center text-stone py-12">
                        {menu?.emptyCategory || 'No items in this category yet.'}
                      </p>
                    )}
                  </div>
                );
              })}
              
              {/* Allergen Note */}
              <div className="mt-10 pt-6 border-t border-stone/20">
                <p className="text-center text-stone text-sm italic">
                  {menu?.allergenNote || 'Please ask our team about allergens and dietary requirements.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
