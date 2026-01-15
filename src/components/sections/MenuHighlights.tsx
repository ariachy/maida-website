'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

const featuredFood = [
  {
    name: 'Shish Barak',
    description: 'fried minced beef dumplings sauteed in chili paste, served over farlicky yogurt and caramelized onions, with roasted almonds.',
    image: '/images/food/shish-barak.webp',
  },
  {
    name: 'Kebab Pistachio',
    description: 'minced meat with pistachios and house spices, sauteed in pomegranate molasses. Served with hummus',
    image: '/images/food/kebab.webp',
  },
  {
    name: 'Muhamara',
    description: 'roasted red pepper dip, walnuts, tahini, pomegranate molasses and a hint of chili',
    image: '/images/food/muhamara.webp',
  },
  {
    name: 'Shawarma',
    description: '(beef) with fries, onions and parsley salad, tomato, pickles, tahini dressing and saj bread',
    image: '/images/food/shawarma.webp',
  },
];

const featuredDrinks = [
  {
    name: 'Manhattan',
    description: 'Whiskey, sweet vermouth, bitters',
    image: '/images/drinks/manhattan.webp',
  },
  {
    name: 'Zhourat Tea',
    description: 'Traditional Lebanese herbal blend',
    image: '/images/drinks/zhourat-tea.webp',
  },
  {
    name: 'Cortado',
    description: 'Espresso, steamed milk',
    image: '/images/drinks/coffee-cortado.webp',
  },
];

interface MenuHighlightsProps {
  translations: any;
  locale: Locale;
}

function PlaceholderImage({ name, type }: { name: string; type: 'food' | 'drink' }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center ${type === 'food' ? 'bg-sand/50' : 'bg-charcoal/10'}`}>
      <div className="text-center p-4">
        <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${type === 'food' ? 'bg-terracotta/20' : 'bg-sage/20'}`}>
          {type === 'food' ? (
            <svg className="w-6 h-6 text-terracotta/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-sage/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </div>
        <p className="text-xs text-stone/60">Image coming soon</p>
      </div>
    </div>
  );
}

export default function MenuHighlights({ translations, locale }: MenuHighlightsProps) {
  const foodScrollRef = useRef<HTMLDivElement>(null);
  const drinksScrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [canScrollFoodLeft, setCanScrollFoodLeft] = useState(false);
  const [canScrollFoodRight, setCanScrollFoodRight] = useState(true);
  const [canScrollDrinksLeft, setCanScrollDrinksLeft] = useState(false);
  const [canScrollDrinksRight, setCanScrollDrinksRight] = useState(true);
  const [foodImageErrors, setFoodImageErrors] = useState<Record<string, boolean>>({});
  const [drinkImageErrors, setDrinkImageErrors] = useState<Record<string, boolean>>({});

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
    <section className="pt-16 md:pt-20 pb-12 md:pb-16 px-6 bg-warm-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header - Stacked Title */}
        <motion.div
          className="mb-10 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-terracotta leading-[1.1]">
            <span className="block">A TASTE</span>
            <span className="block">OF MAÍDA</span>
          </h2>
        </motion.div>

        {/* Food Section Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-base md:text-lg tracking-[0.15em] uppercase text-charcoal font-semibold">
            From our kitchen
          </p>
        </motion.div>

        {/* Food Items - Horizontal Scroll */}
        <div className="relative mb-12">
          {mounted && canScrollFoodLeft && (
            <button
              onClick={() => scrollFood('left')}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg items-center justify-center transition-all duration-300 hover:bg-sand -translate-x-1/2"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {mounted && canScrollFoodRight && (
            <button
              onClick={() => scrollFood('right')}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg items-center justify-center transition-all duration-300 hover:bg-sand translate-x-1/2"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div
            ref={foodScrollRef}
            onScroll={checkFoodScroll}
            className="flex gap-5 md:gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide scroll-pl-6"
          >
            {featuredFood.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex-shrink-0 w-[75vw] max-w-[260px] md:w-[280px] md:max-w-none snap-start"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group cursor-pointer">
                  <div className="relative aspect-square mb-4 overflow-hidden bg-sand/30">
                    {foodImageErrors[item.name] ? (
                      <PlaceholderImage name={item.name} type="food" />
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setFoodImageErrors(prev => ({ ...prev, [item.name]: true }))}
                      />
                    )}
                  </div>
                  <h3 className="font-display text-xl font-medium text-charcoal group-hover:text-terracotta transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-stone mt-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Divider with Emblem */}
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

        {/* Drinks Section Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-base md:text-lg tracking-[0.15em] uppercase text-charcoal font-semibold">
            From our bar
          </p>
        </motion.div>

        {/* Drinks Items - Horizontal Scroll */}
        <div className="relative mb-12">
          {mounted && canScrollDrinksLeft && (
            <button
              onClick={() => scrollDrinks('left')}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg items-center justify-center transition-all duration-300 hover:bg-sand -translate-x-1/2"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {mounted && canScrollDrinksRight && (
            <button
              onClick={() => scrollDrinks('right')}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg items-center justify-center transition-all duration-300 hover:bg-sand translate-x-1/2"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div
            ref={drinksScrollRef}
            onScroll={checkDrinksScroll}
            className="flex gap-5 md:gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide scroll-pl-6"
          >
            {featuredDrinks.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex-shrink-0 w-[75vw] max-w-[260px] md:w-[280px] md:max-w-none snap-start"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group cursor-pointer">
                  <div className="relative aspect-square mb-4 overflow-hidden bg-sand/30">
                    {drinkImageErrors[item.name] ? (
                      <PlaceholderImage name={item.name} type="drink" />
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setDrinkImageErrors(prev => ({ ...prev, [item.name]: true }))}
                      />
                    )}
                  </div>
                  <h3 className="font-display text-xl font-medium text-charcoal group-hover:text-terracotta transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-stone mt-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Full Menu button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link 
            href={`/${locale}/menu`} 
            className="bg-terracotta text-warm-white px-8 py-4 text-sm font-medium hover:bg-terracotta/90 transition-colors inline-block"
          >
            Full Menu
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
