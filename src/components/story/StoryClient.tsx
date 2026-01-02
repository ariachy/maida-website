'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';

interface StoryClientProps {
  translations: any;
  locale: Locale;
}

export default function StoryClient({ translations, locale }: StoryClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const handleReserveClick = () => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c',
        widgetType: 'reservation',
      });
      (window as any).umaiWidget.openWidget();
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div ref={containerRef} className="bg-cream">
      {/* Hero Section - UPDATED: Changed label */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero/facade-night.webp"
            alt="Maída restaurant exterior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-charcoal/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* UPDATED: Changed from "Our Story" label to "What brought us here" */}
          <motion.p
            className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-sand mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-sand" />
            What brought us here
            <span className="w-8 h-px bg-sand" />
          </motion.p>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                Our Story
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="text-lg md:text-xl text-sand/90 max-w-xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            A gathering table in the heart of Lisbon
          </motion.p>
        </div>
      </section>

      {/* The Meaning Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Arabic Card - UPDATED: Using emblem pattern instead of stars */}
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
            >
              <div 
                className="aspect-square bg-gradient-to-br from-terracotta to-rust flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  backgroundImage: `url('/images/brand/emblem.svg')`,
                  backgroundSize: '60px',
                  backgroundRepeat: 'repeat',
                  backgroundBlendMode: 'soft-light',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta to-rust opacity-90" />
                <div className="relative z-10 text-center p-8">
                  <span className="font-display text-8xl md:text-9xl text-warm-white/90 arabic-text block mb-4">
                    مائدة
                  </span>
                  <span className="text-sm tracking-[0.3em] uppercase text-warm-white/70">
                    ma'ida
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.p 
                className="text-xs tracking-[0.3em] uppercase text-terracotta mb-4"
                variants={fadeInUp}
              >
                The meaning
              </motion.p>

              <motion.h2 
                className="font-display text-4xl md:text-5xl font-light mb-8 text-charcoal"
                variants={fadeInUp}
              >
                More than<br />
                <span className="text-terracotta italic">a word</span>
              </motion.h2>

              <motion.div className="space-y-6 text-stone text-lg leading-relaxed" variants={fadeInUp}>
                <p>
                  In Arabic, <span className="text-terracotta font-medium">المائدة</span> (al-māʾidah) doesn't just mean "table."
                </p>
                <p>
                  It's the gathering table. Where family and friends come together, where stories are shared over plates passed hand to hand, where no one leaves hungry.
                </p>
                <p className="text-terracotta italic">
                  In Lebanon, المائدة represents abundance and generosity. That's why our mezze arrive in waves. Why the bread keeps coming. Why we'll always make room for one more.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider - UPDATED: Using emblem instead of star */}
      <div className="max-w-xs mx-auto flex items-center gap-4">
        <span className="flex-1 h-px bg-stone/20" />
        <Image
          src="/images/brand/emblem.svg"
          alt=""
          width={24}
          height={24}
          className="opacity-60"
        />
        <span className="flex-1 h-px bg-stone/20" />
      </div>

      {/* From Beirut to Lisboa - UPDATED: Added "From our roots" title */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Content - Left */}
            <motion.div
              className="md:order-1"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              {/* UPDATED: Added "From our roots" as title above */}
              <motion.p 
                className="text-xs tracking-[0.3em] uppercase text-terracotta mb-4"
                variants={fadeInUp}
              >
                From our roots
              </motion.p>

              <motion.h2 
                className="font-display text-4xl md:text-5xl font-light mb-8 text-charcoal"
                variants={fadeInUp}
              >
                From Beirut<br />
                <span className="text-terracotta italic">to Lisboa</span>
              </motion.h2>

              <motion.div className="space-y-6 text-stone text-lg leading-relaxed" variants={fadeInUp}>
                <p>
                  Our journey began with memories of Lebanese family dinners — tables overflowing with mezze, conversations that lasted hours, and the warmth that comes from sharing food with people you love.
                </p>
                <p>
                  We brought that spirit to Rua da Boavista in Cais do Sodré, where the river meets the city and locals mix with travelers from around the world.
                </p>
                <p className="font-medium text-charcoal">
                  We're not a Lebanese restaurant. We're a Mediterranean restaurant with Lebanese soul — the warmth, the generosity, the belief that food is better when shared.
                </p>
              </motion.div>
            </motion.div>

            {/* Image Grid - Right */}
            <motion.div
              className="md:order-2 grid grid-cols-2 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.div className="space-y-4" variants={fadeInUp}>
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src="/images/food/shawarma.webp"
                    alt="Signature Shawarma"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src="/images/drinks/tea-topview.webp"
                    alt="Traditional tea"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
              <motion.div className="space-y-4 pt-8" variants={fadeInUp}>
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src="/images/food/feta-brulee.webp"
                    alt="Feta Brûlée"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src="/images/drinks/cocktail-making.webp"
                    alt="Cocktail preparation"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHO WE ARE Section (Replaces "What We Believe")
          UPDATED: Complete replacement with Anna & Anthony story
          ============================================ */}
      <section className="py-24 md:py-32 px-6 bg-charcoal text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            
            {/* Photo Placeholder - UPDATED: Portrait ratio */}
            <motion.div
              className="relative aspect-[3/4] bg-stone/20 overflow-hidden"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Placeholder for Anna & Anthony photo */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone/30 to-stone/10">
                <div className="text-center">
                  <Image
                    src="/images/brand/emblem.svg"
                    alt=""
                    width={60}
                    height={60}
                    className="mx-auto mb-4 opacity-30"
                  />
                  <p className="text-sand/50 text-sm">Anna & Anthony</p>
                  <p className="text-sand/30 text-xs mt-1">Photo coming soon</p>
                </div>
              </div>
              {/* 
              When you have the photo, replace with:
              <Image
                src="/images/about/anna-anthony.webp"
                alt="Anna and Anthony, founders of Maída"
                fill
                className="object-cover"
              />
              */}
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-xs tracking-[0.3em] uppercase text-terracotta-light mb-4">
                Who we are
              </p>
              
              <h2 className="font-display text-3xl md:text-4xl font-light mb-8">
                Anna & Anthony
              </h2>
              
              <div className="space-y-6 text-sand/90 text-lg leading-relaxed">
                <p>
                  <span className="italic text-terracotta-light">Maída</span> was born from a shared dream between Anna and Anthony — 
                  to bring the warmth of Lebanese hospitality to the heart of Lisbon.
                </p>
                <p>
                  {/* Placeholder - replace with actual story */}
                  With roots stretching from the mountains of Lebanon to the vibrant streets of Lisbon, 
                  they found common ground in their love for food that brings people together, 
                  conversations that linger, and evenings that become memories.
                </p>
                <p>
                  Today, you'll find them both where they belong: at the table, 
                  making sure no glass stays empty and no guest leaves hungry.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA - UPDATED: Removed "Come" from the beginning */}
      <section className="py-24 md:py-32 px-6 text-center">
        <motion.div
          className="max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-charcoal"
            variants={fadeInUp}
          >
            {/* UPDATED: Changed "Come find your place" to "Find your place" */}
            Find your place
            <br />
            <span className="text-terracotta italic">at the table</span>
          </motion.h2>

          <motion.p 
            className="text-stone text-lg mb-10"
            variants={fadeInUp}
          >
            #MeetMeAtMaída
          </motion.p>

          <motion.button
            onClick={handleReserveClick}
            className="btn btn-primary text-lg px-10 py-4"
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Reserve a table
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}