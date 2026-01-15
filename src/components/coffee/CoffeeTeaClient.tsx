'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface CoffeeTeaClientProps {
  translations: any;
  locale: Locale;
}

// Featured Items
const featuredItems = [
  { 
    name: 'Lavender Coffee', 
    description: 'americano with house-made lavender syrup',
    category: 'coffee',
  },
  { 
    name: 'Lebanese Coffee', 
    description: 'traditional Lebanese coffee. Most enjoyed with cardamon!',
    category: 'coffee',
  },
  { 
    name: 'Cafe Blanc', 
    description: 'orange blossom and a bit of honey',
    category: 'coffee',
  },
  { 
    name: 'Moroccan Mint', 
    description: 'fresh mint, green tea, from Morocco',
    category: 'tea',
  },
  { 
    name: 'Maída Tea', 
    description: 'In-house blend of herbs. Soothing & calming',
    category: 'tea',
  },
  { 
    name: 'Zhourat', 
    description: 'our version of the tradional Lebanese herbal blend "Zhourat"',
    category: 'tea',
  },
];

export default function CoffeeTeaClient({ translations, locale }: CoffeeTeaClientProps) {
  const handleReserveClick = () => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c',
        widgetType: 'reservation',
      });
      (window as any).umaiWidget.openWidget();
    }
  };

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
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="bg-cream">
      {/* ============================================
          HERO SECTION - matching other pages
          ============================================ */}
      <section className="relative min-h-[calc(100svh-100px)] md:min-h-[calc(100svh-120px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/drinks/coffee-cortado.webp"
            alt="Coffee at Maída"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-charcoal/60" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-16 md:pt-20">
          <motion.p
            className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-sand mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-sand" />
            Mediterranean warmth in every cup
            <span className="w-8 h-px bg-sand" />
          </motion.p>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 leading-[1.1]">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                Coffee <span className="text-terracotta-light italic">& Tea</span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="text-base md:text-xl text-sand/90 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            From traditional Lebanese coffee to signature blends.
            <br />
            Every sip tells a story.
          </motion.p>
        </div>
      </section>

      {/* ============================================
          OUR COFFEE SECTION
          ============================================ */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
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
                Our <span className="text-terracotta italic">Coffee</span>
              </motion.h2>

              <motion.div className="space-y-5 text-stone text-lg leading-relaxed" variants={fadeInUp}>
                <p>
                  At Maída, we craft bold signature coffee drinks that honor Mediterranean tradition. To achieve this, we needed the perfect canvas - a smooth, balanced espresso that could hold its own alongside aromatic lavender, cardamom, and our house-made blends.
                </p>
                <p>
                  We partnered with{' '}
                  <a 
                    href="https://www.baoba.pt" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-terracotta hover:underline font-medium"
                  >
                    Baobá Coffee
                  </a>
                  {' '}to source their 100% Arabica blend from Brazil - a balanced, versatile roast perfect for smooth espresso or specialty drinks. Lisbon roasters who share our obsession with quality.
                </p>
                <p className="text-terracotta italic">
                  Come for the coffee. Stay for the conversation.
                </p>
              </motion.div>
            </motion.div>

            {/* Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src="/images/drinks/coffee-cortado.webp"
                  alt="Specialty coffee at Maída"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          OUR TEAS SECTION (Dark)
          ============================================ */}
      <section className="py-20 md:py-28 px-6 bg-charcoal text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Visual */}
            <motion.div
              className="relative md:order-1"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src="/images/drinks/tea-topview.webp"
                  alt="Traditional tea at Maída"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="md:order-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.h2 
                className="font-display text-4xl md:text-5xl font-light mb-8"
                variants={fadeInUp}
              >
                Our <span className="text-terracotta-light italic">Teas</span>
              </motion.h2>

              <motion.div className="space-y-5 text-sand/80 text-lg leading-relaxed" variants={fadeInUp}>
                <p>
                  From traditional favorites to exotic regional blends and house-made creations - our tea selection celebrates Mediterranean and Lebanese tea culture.
                </p>
                <p>
                  We source the finest loose-leaf teas from trusted suppliers, from classic Moroccan mint to our signature Maída tea with a mix of soothing and relaxing herbs.
                </p>
                <p className="text-terracotta-light italic">
                  Every sip tells a story.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED ITEMS SECTION
          ============================================ */}
      <section className="py-20 md:py-28 px-6 bg-warm-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-display text-4xl md:text-5xl font-light mb-4 text-charcoal">
              Featured <span className="text-terracotta italic">Coffees & Teas</span>
            </h2>
            <p className="text-stone text-lg max-w-2xl mx-auto">
              Signature creations and traditional favorites
            </p>
          </motion.div>

          {/* Featured Items Grid */}
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {featuredItems.map((item, index) => (
              <motion.div 
                key={index}
                className="bg-cream p-6 border border-sand/50 hover:border-terracotta/30 transition-colors"
                variants={fadeInUp}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-display text-xl text-charcoal">{item.name}</h3>
                  <span className="text-[9px] px-1.5 py-0.5 bg-sand/50 text-stone font-medium uppercase shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-stone text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button + Takeaway pill */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-block text-xs tracking-wide uppercase text-stone bg-sand/60 px-4 py-1.5 rounded-full mb-4">
              Also available for takeaway
            </span>
            <br />
            <Link
              href={`/${locale}/menu#coffee-tea`}
              className="inline-block bg-terracotta text-warm-white px-8 py-3 font-medium hover:bg-terracotta/90 transition-colors"
            >
              View Coffee & Tea Menu
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA - Terracotta with Emblem Pattern
          ============================================ */}
      <section 
        className="relative py-16 md:py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgb(198, 125, 94) 0%, rgb(166, 93, 63) 100%)' }}
      >
        {/* Emblem Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url('/images/brand/emblem.svg')`,
            backgroundSize: '100px',
            backgroundRepeat: 'repeat',
            filter: 'brightness(0)',
          }}
        />
        
        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-medium text-warm-white mb-4">
            Your table is waiting
          </h2>
          <p className="text-warm-white/80 text-lg mb-8">
            #MeetMeAtMaída
          </p>
          <button 
            onClick={handleReserveClick} 
            className="bg-charcoal text-warm-white px-10 py-4 text-lg font-medium hover:bg-warm-white hover:text-charcoal transition-colors"
          >
            Reserve a Table
          </button>
        </motion.div>
      </section>
    </div>
  );
}
