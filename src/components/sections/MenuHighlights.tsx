'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

interface MenuItem {
  name: string;
  description: string;
  price: string;
  image: string;
}

interface MenuHighlightsProps {
  translations: any;
  locale: string;
}

const featuredItems: MenuItem[] = [
  {
    name: 'SAJ Halloumi Bacon',
    description: 'Crispy halloumi, bacon, fresh from the griddle',
    price: '€11.60',
    image: '/images/food/halloumi.webp',
  },
  {
    name: 'Feta Brûlée',
    description: 'Caramelized feta - a guest favorite',
    price: '€9.70',
    image: '/images/food/feta-brulee.webp',
  },
  {
    name: 'Shawarma',
    description: 'Beef with fries, salad, tahini, saj bread',
    price: '€17.30',
    image: '/images/food/shawarma.webp',
  },
  {
    name: 'Lavender Coffee',
    description: 'Our signature coffee creation',
    price: '€3.90',
    image: '/images/drinks/coffee-cortado.webp',
  },
];

export default function MenuHighlights({ translations, locale }: MenuHighlightsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial scroll state after mount
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollWidth > clientWidth);
    }
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-terracotta mb-4">
            From Our Kitchen
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-charcoal">
            Made for sharing
          </h2>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          {/* Left Arrow - only show after mount */}
          {mounted && canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-sand -translate-x-1/2"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow - only show after mount */}
          {mounted && canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-sand translate-x-1/2"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Scrollable Items */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredItems.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex-shrink-0 w-[280px] md:w-[300px] snap-start"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group cursor-pointer">
                  {/* Image */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Price Tag */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="font-medium text-charcoal">{item.price}</span>
                    </div>
                  </div>
                  
                  {/* Text */}
                  <h3 className="font-display text-xl text-charcoal mb-1 group-hover:text-terracotta transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-stone text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Note + CTA */}
        <motion.div
          className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-stone italic">
            Order generously. Pass freely. That&apos;s the way.
          </p>
          <Link
            href={`/${locale}/menu`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-full font-medium hover:bg-charcoal/90 transition-colors w-fit"
          >
            View Full Menu
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
