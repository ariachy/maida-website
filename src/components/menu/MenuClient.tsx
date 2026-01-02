'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CategoryCard from '@/components/ui/CategoryCard';
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
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const { menu } = translations;
  const { categories, items } = menuData;
  
  // Sort categories by sortOrder
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Get items for active category
  const activeItems = items
    .filter((item) => item.categoryId === activeCategory)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Get active category data
  const activeCategoryData = sortedCategories.find((cat) => cat.id === activeCategory);
  
  // Handle scroll arrows visibility
  const updateArrows = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateArrows);
      updateArrows();
      return () => container.removeEventListener('scroll', updateArrows);
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
    <div className="min-h-screen pt-24 md:pt-32 pb-16">
      {/* Header */}
      <div className="text-center px-6 mb-10">
        <h1 className="font-display text-fluid-4xl font-light text-charcoal mb-2">
          {menu.title}
        </h1>
        <p className="text-stone">{menu.subtitle}</p>
      </div>
      
      {/* Category Carousel */}
      <div className="relative mb-12 px-4">
        <div className="max-w-6xl mx-auto relative">
          {/* Left Arrow */}
          <AnimatePresence>
            {showLeftArrow && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-warm-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-warm-white transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth-x py-2 px-8"
          >
            {sortedCategories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={menu.categories[category.id]?.name || category.id}
                image={category.image}
                isActive={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
          
          {/* Right Arrow */}
          <AnimatePresence>
            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-warm-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-warm-white transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="max-w-3xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Category Header */}
            <div className="text-center mb-10">
              <h2 className="font-display text-fluid-2xl text-charcoal mb-2">
                {menu.categories[activeCategory]?.name}
              </h2>
              <p className="text-stone text-sm">
                {menu.categories[activeCategory]?.description}
              </p>
              <div className="w-16 h-px bg-terracotta mx-auto mt-4" />
            </div>
            
            {/* Items List */}
            <div className="space-y-1">
              {activeItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
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
                No items in this category yet.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
