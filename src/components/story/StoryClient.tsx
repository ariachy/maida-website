'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';

interface StoryClientProps {
  translations: any;
  locale: Locale;
}

export default function StoryClient({ translations, locale }: StoryClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="bg-cream overflow-x-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-[calc(100svh-100px)] md:min-h-[calc(100svh-120px)] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero/facade-night-people.webp"
            alt="Maída restaurant exterior at night"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-charcoal/60" />
        </div>

        {/* Content - with top offset for navbar */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-16 md:pt-20">
          <motion.p
            className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-sand mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-sand" />
            What brought us here
            <span className="w-8 h-px bg-sand" />
          </motion.p>

          {/* Title - single line */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 leading-[1.1]">
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
            className="text-base md:text-xl text-sand/90 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            A place where flavors, music, and good company come together.
            <br />
            Rooted in tradition, reimagined for today.
          </motion.p>
        </div>
      </section>

      {/* ============================================
          WHITESPACE SECTION with title
          ============================================ */}
      <section className="py-10 md:py-14 bg-warm-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl text-charcoal">
            A traditional feast, <span className="italic text-terracotta">reimagined for today</span>
          </h2>
        </div>
      </section>

      {/* ============================================
          THE MEANING SECTION - Definition Card (50/50 split like homepage)
          ============================================ */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[350px] md:min-h-[400px]">
          
          {/* Left - Terracotta Panel with Definition */}
          <motion.div
            className="bg-terracotta flex items-center relative overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Arabic Text Background Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.08] text-warm-white pointer-events-none select-none overflow-hidden"
              style={{
                fontFamily: 'serif',
                fontSize: '80px',
                lineHeight: '1.2',
                whiteSpace: 'nowrap',
              }}
            >
              {[...Array(8)].map((_, row) => (
                <div key={row} className="flex" style={{ transform: row % 2 === 0 ? 'translateX(-20px)' : 'translateX(20px)' }}>
                  {[...Array(10)].map((_, col) => (
                    <span key={col} className="mx-4">مائدة</span>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="px-6 md:px-10 lg:px-12 py-8 md:py-10 relative z-10 max-w-xl">
              {/* Body Text */}
              <div className="space-y-4 text-warm-white/90 text-base leading-relaxed">
                <p>
                  Inspired by <span className="font-medium">المائدة</span> (al-mā'idah), the beloved tradition of gathering, feasting, and celebrating with loved ones around a big table, Maída brings people together with authentic Mediterranean flavors & drinks, our in-house Saj Manoushe, and dishes that evolve throughout the day - all complemented by a smooth musical experience, elevated by our hi-fi sound system.
                </p>
                <p className="italic">
                  It's the gathering table. Where family and friends come together, and stories are shared between bites.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Right - Image */}
          <motion.div
            className="relative h-[250px] md:h-auto"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          >
            <Image
              src="/images/atmosphere/private-event.webp"
              alt="Private event at Maída"
              fill
              className="object-cover"
            />
          </motion.div>
          
        </div>
      </section>

      {/* ============================================
          FROM BEIRUT TO LISBOA
          ============================================ */}
      <section className="py-16 md:py-24 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            
            {/* Text Content - Left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              {/* Stacked Title */}
              <motion.h2 
                className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-[1.1] mb-6"
                variants={fadeInUp}
              >
                <span className="block">FROM</span>
                <span className="block">BEIRUT TO</span>
                <span className="block text-terracotta">LISBOA</span>
              </motion.h2>

              <motion.div 
                className="space-y-5 text-stone text-base leading-relaxed"
                variants={fadeInUp}
              >
                <p>
                  In Lebanon, meals are never rushed. They're occasions - long gatherings where everyone lingers, glasses clink, and stories grow louder with every round.
                </p>
                <p>
                  When we arrived in Lisbon, we discovered something familiar: the Portuguese share this same love for gathering around a big table and turning a meal into an occasion. It felt like home.
                </p>
                <p className="font-medium text-charcoal">
                  That's how two worlds became one. Maída is a Mediterranean restaurant with Lebanese soul in the heart of Cais do Sodré - where Portuguese warmth meets Lebanese generosity.
                </p>
              </motion.div>
            </motion.div>

            {/* Image Grid - Right */}
            <motion.div
              className="grid grid-cols-2 gap-4"
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
          WHO WE ARE - Anna & Anthony Section
          ============================================ */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px] md:min-h-[600px]">
          
          {/* Left - Photo */}
          <motion.div
            className="relative h-[400px] md:h-auto"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/about/AnnaAnthony.webp"
              alt="Anna and Anthony, founders of Maída"
              fill
              className="object-cover object-top"
            />
          </motion.div>

          {/* Right - Charcoal Panel */}
          <motion.div
            className="bg-charcoal flex items-start relative overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="px-6 md:px-10 lg:px-12 py-8 md:py-10">
              <p className="text-xs tracking-[0.3em] uppercase text-terracotta-light mb-4">
                Who we are
              </p>
              
              {/* Stacked Title */}
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white leading-[1.1] mb-8">
                <span className="block">ANNA &</span>
                <span className="block">ANTHONY</span>
              </h2>
              
              <div className="space-y-5 text-sand/90 text-base leading-relaxed">
                <p>
                  <span className="font-medium text-warm-white">Anna</span> is a culinary and animation director by heart, passionate about food, music, and the creative world. Over the years, she refined her skills in cooking and food presentation, turning every plate into a canvas.
                </p>
                <p>
                  <span className="font-medium text-warm-white">Anthony</span> is an electrical engineer and consultant by trade, fascinated by the world of hospitality, mixology, and creating experiences that linger.
                </p>
                <p>
                  After opening The Happy Salad in Lisboa, they shared a dream: to present Lebanese food from a different perspective - not just the familiar classics, but the dishes they grew up eating at home.
                </p>
                <p className="text-terracotta-light italic">
                  Today, you'll find them where they belong: at the table with you - making sure every detail is right, every glass is full, and no guest ever leaves without a story to tell.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section 
        className="relative py-16 md:py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ab5741 0%, #8a4535 100%)' }}
      >
        {/* Emblem Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'url(/images/brand/emblem.svg)',
            backgroundSize: '80px 80px',
            backgroundRepeat: 'repeat',
            filter: 'brightness(0) invert(1)',
          }}
        />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h2 
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-warm-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Find your place at the table
          </motion.h2>

          <motion.p 
            className="text-lg text-warm-white/90 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            #MeetMeAtMaída
          </motion.p>

          <motion.button
            onClick={handleReserveClick}
            className="bg-charcoal text-warm-white px-8 py-4 text-sm font-medium hover:bg-warm-white hover:text-charcoal transition-colors"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Book a table
          </motion.button>
        </div>
      </section>
    </div>
  );
}
