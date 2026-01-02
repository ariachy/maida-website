'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

// Featured food items (NO PRICES - removed per request)
const featuredFood = [
  {
    name: 'Hummus Beiruti',
    description: 'Warm chickpeas, olive oil, pine nuts',
    image: '/images/food/hummus.webp',
  },
  {
    name: 'Lamb Kofta',
    description: 'Grilled spiced lamb, tahini, pomegranate',
    image: '/images/food/kofta.webp',
  },
  {
    name: 'Fattoush',
    description: 'Crispy pita, fresh vegetables, sumac',
    image: '/images/food/fattoush.webp',
  },
  {
    name: 'Chicken Saj',
    description: 'Marinated chicken, garlic sauce, pickles',
    image: '/images/food/saj-chicken.webp',
  },
];

// Featured drinks - Signature cocktails
const featuredDrinks = [
  {
    name: 'Beirut Sunset',
    description: 'Arak, orange blossom, pomegranate',
    image: '/images/drinks/cocktail-1.webp',
  },
  {
    name: 'Cedar Sour',
    description: 'Lebanese whiskey, lemon, honey',
    image: '/images/drinks/cocktail-2.webp',
  },
  {
    name: 'Rose Garden',
    description: 'Gin, rose water, elderflower',
    image: '/images/drinks/cocktail-3.webp',
  },
];

interface MenuHighlightsProps {
  translations: any;
  locale: Locale;
}

export default function MenuHighlights({ translations, locale }: MenuHighlightsProps) {
  const foodScrollRef = useRef<HTMLDivElement>(null);
  const drinksScrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [canScrollFoodLeft, setCanScrollFoodLeft] = useState(false);
  const [canScrollFoodRight, setCanScrollFoodRight] = useState(true);
  const [canScrollDrinksLeft, setCanScrollDrinksLeft] = useState(false);
  const [canScrollDrinksRight, setCanScrollDrinksRight] = useState(true);

  useEffect(() => {
    setMounted(true);
    checkFoodScroll();
    checkDrinksScroll();
  }, []);

  const checkFoodScroll = () => {
    if (foodScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = foodScrollRef.current;
      setCanScrollFoodLeft(scrollLeft > 0);
      setCanScrollFoodRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const checkDrinksScroll = () => {
    if (drinksScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = drinksScrollRef.current;
      setCanScrollDrinksLeft(scrollLeft > 0);
      setCanScrollDrinksRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollFood = (direction: 'left' | 'right') => {
    if (foodScrollRef.current) {
      const scrollAmount = 300;
      foodScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkFoodScroll, 300);
    }
  };

  const scrollDrinks = (direction: 'left' | 'right') => {
    if (drinksScrollRef.current) {
      const scrollAmount = 300;
      drinksScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkDrinksScroll, 300);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ============================================
            FROM OUR KITCHEN - Food Section
            ============================================ */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-terracotta mb-3">
            From our kitchen
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-charcoal">
            Food made for sharing
          </h2>
        </motion.div>

        {/* Food Items - Horizontal Scroll */}
        <div className="relative mb-16">
          {/* Left Arrow */}
          {mounted && canScrollFoodLeft && (
            <button
              onClick={() => scrollFood('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-sand -translate-x-1/2"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow */}
          {mounted && canScrollFoodRight && (
            <button
              onClick={() => scrollFood('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-sand translate-x-1/2"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Scrollable Food Items */}
          <div
            ref={foodScrollRef}
            onScroll={checkFoodScroll}
            className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide"
          >
            {featuredFood.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex-shrink-0 w-[260px] md:w-[280px] snap-start"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group cursor-pointer">
                  {/* Image */}
                  <div className="relative aspect-square mb-4 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {/* Name - NO PRICE */}
                  <h3 className="font-display text-xl text-charcoal group-hover:text-terracotta transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-stone mt-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ============================================
            DIVIDER WITH EMBLEM
            ============================================ */}
        <div className="flex items-center justify-center gap-4 my-12">
          <span className="flex-1 max-w-[100px] h-px bg-stone/20" />
          <Image
            src="/images/brand/emblem.svg"
            alt=""
            width={32}
            height={32}
            className="opacity-60"
          />
          <span className="flex-1 max-w-[100px] h-px bg-stone/20" />
        </div>

        {/* ============================================
            FROM OUR BAR - Drinks Section
            ============================================ */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-terracotta mb-3">
            From our bar
          </p>
          <h3 className="font-display text-2xl md:text-3xl text-charcoal">
            Signature cocktails
          </h3>
        </motion.div>

        {/* Drinks Items - Horizontal Scroll */}
        <div className="relative mb-12">
          {/* Left Arrow */}
          {mounted && canScrollDrinksLeft && (
            <button
              onClick={() => scrollDrinks('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-sand -translate-x-1/2"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow */}
          {mounted && canScrollDrinksRight && (
            <button
              onClick={() => scrollDrinks('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-sand translate-x-1/2"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Scrollable Drinks Items */}
          <div
            ref={drinksScrollRef}
            onScroll={checkDrinksScroll}
            className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide"
          >
            {featuredDrinks.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex-shrink-0 w-[260px] md:w-[280px] snap-start"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group cursor-pointer">
                  {/* Image */}
                  <div className="relative aspect-square mb-4 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {/* Name */}
                  <h3 className="font-display text-xl text-charcoal group-hover:text-terracotta transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-stone mt-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ============================================
            SINGLE CTA - View Full Menu
            ============================================ */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href={`/${locale}/menu`} className="btn btn-primary">
            View full menu
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
