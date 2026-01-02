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
      {/* Hero Section */}
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

        {/* Arabic Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-display text-[20vw] md:text-[15vw] text-white/10 select-none arabic-text">
            مائدة
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.p
            className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-sand mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-sand" />
            #FromOurRoots
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
            {/* Arabic Card */}
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
            >
              <div className="aspect-square bg-terracotta/10 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta/5 to-transparent" />
                <div className="text-center relative z-10">
                  <span className="font-display text-8xl md:text-9xl text-terracotta block mb-4 arabic-text">
                    مائدة
                  </span>
                  <p className="text-sm tracking-[0.2em] uppercase text-stone">
                    ma'ida
                  </p>
                </div>
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-terracotta/20 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-terracotta/20 rounded-bl-3xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.h2 
                className="font-display text-4xl md:text-5xl font-light mb-8 text-charcoal"
                variants={fadeInUp}
              >
                The meaning of{' '}
                <span className="text-terracotta font-display arabic-text">مائدة</span>
              </motion.h2>

              <motion.div className="space-y-6 text-stone text-lg leading-relaxed" variants={fadeInUp}>
                <p>
                  <strong className="text-charcoal">Maída</strong> means "the table" in Arabic — but not just any table.
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

      {/* Divider */}
      <div className="max-w-xs mx-auto flex items-center gap-4">
        <span className="flex-1 h-px bg-stone/20" />
        <span className="text-terracotta text-2xl">✦</span>
        <span className="flex-1 h-px bg-stone/20" />
      </div>

      {/* From Beirut to Lisboa */}
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
              <motion.p 
                className="text-xs tracking-[0.3em] uppercase text-terracotta mb-4"
                variants={fadeInUp}
              >
                #FromOurRoots
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
                <div className="aspect-[3/4] relative rounded-2xl overflow-hidden">
                  <Image
                    src="/images/food/shawarma.webp"
                    alt="Signature Shawarma"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="aspect-square relative rounded-2xl overflow-hidden">
                  <Image
                    src="/images/drinks/tea-topview.webp"
                    alt="Traditional tea"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
              <motion.div className="space-y-4 pt-8" variants={fadeInUp}>
                <div className="aspect-square relative rounded-2xl overflow-hidden">
                  <Image
                    src="/images/food/feta-brulee.webp"
                    alt="Feta Brûlée"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="aspect-[3/4] relative rounded-2xl overflow-hidden">
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

      {/* What We Believe - Full Width Cards */}
      <section className="py-24 md:py-32 px-6 bg-charcoal text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-display text-4xl md:text-5xl font-light mb-4">
              What we believe
            </h2>
            <p className="text-sand/70 text-lg">Three pillars that guide everything we do</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {/* Pillar 1 */}
            <motion.div 
              className="group p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors duration-500"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 rounded-full bg-terracotta/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-3xl">🍽</span>
              </div>
              <h3 className="font-display text-2xl mb-4">Mediterranean Soul</h3>
              <p className="text-sand/70 leading-relaxed">
                Our SAJ bread is baked fresh on a traditional griddle. Our hummus is made daily. Our portions are generous because that's how family feeds family.
              </p>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div 
              className="group p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors duration-500"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 rounded-full bg-terracotta/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="font-display text-2xl mb-4">Gathering Place</h3>
              <p className="text-sand/70 leading-relaxed">
                Our communal table isn't just furniture — it's an invitation. First visit, you're curious. Week two, you return for that Lavender Coffee. Month three, you bring friends to "your place."
              </p>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div 
              className="group p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors duration-500"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 rounded-full bg-terracotta/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-3xl">🎵</span>
              </div>
              <h3 className="font-display text-2xl mb-4">Living Atmosphere</h3>
              <p className="text-sand/70 leading-relaxed">
                Lunchtime: Bright light, gentle music, espresso humming. Evening: Candles flickering, cocktails shaking, beats building. Same address, different worlds.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
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
            Come find your place
            <br />
            <span className="text-terracotta italic">at the table</span>
          </motion.h2>

          <motion.p 
            className="text-stone text-lg mb-10"
            variants={fadeInUp}
          >
            #MeetMeAtMaida
          </motion.p>

          <motion.button
            onClick={handleReserveClick}
            className="btn btn-primary text-lg px-10 py-4"
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Reserve a Table
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
