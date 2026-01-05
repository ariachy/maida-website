'use client';

import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface StoryClientProps {
  translations: any;
  locale: Locale;
}

// Traditional Ma'ida gathering images for carousel
// Replace these with your own images later: /images/story/maida-1.webp, etc.
const maidaImages = [
  {
    src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    alt: 'Traditional Middle Eastern feast with multiple dishes',
  },
  {
    src: 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800&h=600&fit=crop',
    alt: 'Family gathering around a table with shared plates',
  },
  {
    src: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop',
    alt: 'Abundance of Mediterranean dishes on a table',
  },
];

export default function StoryClient({ translations, locale }: StoryClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % maidaImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReserveClick = () => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c',
        widgetType: 'reservation',
      });
      (window as any).umaiWidget.openWidget();
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % maidaImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + maidaImages.length) % maidaImages.length);
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
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-0 md:min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 md:py-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/atmosphere/facade-night.webp"
            alt="Maída restaurant exterior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-charcoal/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
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

          <h1 className="font-display text-4xl md:text-7xl lg:text-8xl font-light text-white mb-4 md:mb-6">
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
            className="text-base md:text-xl text-sand/90 max-w-2xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            A place where flavors, music, and good company come together.
            <br className="hidden md:block" />
            Rooted in tradition, reimagined for today.
          </motion.p>
        </div>
      </section>

      {/* ============================================
          THE MEANING SECTION - Image Carousel + New Text
          ============================================ */}
      <section className="py-16 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Image Carousel - Left Side */}
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-sand/20">
                {maidaImages.map((image, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                ))}
                
                {/* Carousel Controls */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button
                    onClick={prevImage}
                    className="w-10 h-10 bg-warm-white/80 backdrop-blur-sm flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-warm-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="w-10 h-10 bg-warm-white/80 backdrop-blur-sm flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-warm-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {maidaImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-terracotta' : 'bg-warm-white/50'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Text Content - Right Side */}
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
                The meaning of مائدة
              </motion.p>

              <motion.h2 
                className="font-display text-3xl md:text-4xl text-charcoal mb-6"
                variants={fadeInUp}
              >
                More than food on a table
              </motion.h2>

              <motion.div 
                className="space-y-4 text-stone text-base md:text-lg leading-relaxed"
                variants={fadeInUp}
              >
                <p>
                  <span className="font-medium text-charcoal">Maída (مائدة)</span> - the gathering table. In Arabic, it means more than just a piece of furniture. It's the heart of the home, where families come together, stories are shared, and memories are made.
                </p>
                <p>
                  Growing up in Lebanon, our fondest memories revolve around the ma'ida - overflowing with mezze, surrounded by laughter, where no one leaves hungry and conversations linger long after the last bite.
                </p>
                <p>
                  This is what we wanted to bring to Lisboa: not just food, but that feeling. The warmth. The generosity. The joy of sharing a meal with people you love.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FROM BEIRUT TO LISBOA
          ============================================ */}
      <section className="py-16 md:py-32 px-6 bg-sand/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Text - Left */}
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
                From Beirut to Lisboa
              </motion.p>

              <motion.h2 
                className="font-display text-3xl md:text-4xl text-charcoal mb-6"
                variants={fadeInUp}
              >
                Two worlds, one table
              </motion.h2>

              <motion.div 
                className="space-y-4 text-stone text-base md:text-lg leading-relaxed"
                variants={fadeInUp}
              >
                <p>
                  We left Lebanon with recipes passed down through generations, flavors that tell stories of our grandmothers' kitchens, and a dream to share them with the world.
                </p>
                <p>
                  When we arrived in Lisbon, we discovered something familiar: the Portuguese share this same love for gathering around a big table and turning a meal into an occasion. It felt like home.
                </p>
                <p className="font-medium text-charcoal">
                  That's how two worlds became one. Maída is a Mediterranean restaurant with Lebanese soul in the heart of Cais do Sodré - where Portuguese warmth meets Lebanese generosity, celebrating what both cultures share: the belief that food is meant to bring people together.
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
          WHO WE ARE - Anna & Anthony Section
          ============================================ */}
      <section className="py-16 md:py-32 px-6 bg-charcoal text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            
            {/* Photo Placeholder */}
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
              
              <div className="space-y-5 text-sand/90 text-base leading-relaxed">
                <p>
                  <span className="font-medium text-warm-white">Anna</span> is a creative and animation director by heart, passionate about food, music, and the creative world. Over the years, she refined her skills in cooking and food presentation, turning every plate into a canvas.
                </p>
                <p>
                  <span className="font-medium text-warm-white">Anthony</span> is an electrical engineer and consultant by trade, fascinated by the world of hospitality, mixology, and creating experiences that linger.
                </p>
                <p>
                  A lifelong passion for music led them to curate the soundscape that fills every experience at Maída.
                </p>
                <p>
                  After opening The Happy Salad in Lisboa, they shared a dream: to present Lebanese food from a different perspective - not just the familiar classics, but the dishes they grew up eating at home. Food from across the Mediterranean, always made with Lebanese soul.
                </p>
                <p>
                  With roots stretching from the mountains of Lebanon to the vibrant streets of Lisbon, they found common ground in their love for food that brings people together, conversations that linger long after the last bite, and evenings that turn into memories you carry with you.
                </p>
                <p className="text-terracotta-light italic">
                  Today, you'll find them where they belong: at the table with you - making sure every detail is right, every glass is full, and no guest ever leaves without a story to tell.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA - Matches Homepage Style with Emblem Pattern
          ============================================ */}
      <section 
        className="relative py-16 md:py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgb(198, 125, 94) 0%, rgb(166, 93, 63) 100%)' }}
      >
        {/* Emblem Pattern - darker for visibility on terracotta */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url('/images/brand/emblem.svg')`,
            backgroundSize: '100px',
            backgroundRepeat: 'repeat',
            filter: 'brightness(0)',
          }}
        />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h2 
            className="font-display text-fluid-3xl font-light text-warm-white mb-4"
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
            className="btn bg-charcoal text-warm-white hover:bg-warm-white hover:text-charcoal"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Reserve a Table
          </motion.button>
        </div>
      </section>
    </div>
  );
}
