'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface CoffeeTeaClientProps {
  translations: any;
  locale: Locale;
}

// Coffee Menu
const coffeeItems = [
  { name: 'Espresso', price: '€1.80' },
  { name: 'Espresso Double', price: '€3.00' },
  { name: 'Cortado', price: '€1.80' },
  { name: 'Americano', price: '€2.60' },
  { name: 'Americano (iced)', price: '€2.60' },
  { name: 'Macchiato', price: '€3.20' },
  { name: 'Latte Macchiato', price: '€3.70' },
  { name: 'Latte', price: '€4.10' },
  { name: 'Latte (iced)', price: '€4.10' },
  { name: 'Cappuccino', price: '€3.90' },
  { name: 'Flat White', price: '€3.90' },
  { name: 'Mocha', price: '€3.90' },
  { name: 'Lavender Coffee', price: '€3.90', signature: true },
  { name: 'Hot Chocolate', price: '€3.50' },
];

// Tea Menu
const teaItems = [
  { name: 'Moroccan Mint', description: 'Fresh mint, green tea', price: '€3.30' },
  { name: 'Zhourat', description: 'Traditional Lebanese herbal blend', price: '€3.50' },
  { name: 'Maída Blend', description: 'Rose syrup, mastic, house blend', price: '€3.50', signature: true },
  { name: 'Cafe Blanc', description: 'White coffee with orange blossom water', price: '€3.20' },
  { name: 'Other Teas', description: 'Ask for our selection', price: '€2.80' },
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
      transition: { staggerChildren: 0.08 }
    }
  };

  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
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

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20">
          <motion.p
            className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-sand mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-sand" />
            Slow Down
            <span className="w-8 h-px bg-sand" />
          </motion.p>

          <h1 className="font-display text-5xl md:text-7xl font-light text-white mb-6">
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
            className="text-lg md:text-xl text-sand/90 max-w-xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            From Baobá beans to Lebanese traditions
          </motion.p>
        </div>
      </section>

      {/* Our Coffee Section */}
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

              <motion.div className="space-y-6 text-stone text-lg leading-relaxed" variants={fadeInUp}>
                <p>
                  We serve specialty coffee from <strong className="text-charcoal">Baobá</strong> — Lisbon roasters who share our obsession with quality.
                </p>
                <p>
                  But we're not just an espresso bar. Try our <strong className="text-charcoal">Lavender Coffee</strong> for something unexpected, or go traditional with a <strong className="text-charcoal">Lebanese Cafe Blanc</strong> — white coffee with orange blossom water.
                </p>
                <p className="text-terracotta italic">
                  Every cup is an invitation to slow down.
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
              <div className="aspect-square rounded-3xl overflow-hidden">
                <Image
                  src="/images/drinks/coffee-cortado.webp"
                  alt="Cortado at Maída"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-terracotta/10 rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Teas Section */}
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
              <div className="aspect-square rounded-3xl overflow-hidden">
                <Image
                  src="/images/drinks/tea-topview.webp"
                  alt="Traditional tea at Maída"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-sage/20 rounded-full -z-10" />
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

              <motion.div className="space-y-6 text-sand/80 text-lg leading-relaxed" variants={fadeInUp}>
                <p>
                  <strong className="text-white">Moroccan mint.</strong> Zhourat — the Lebanese herbal blend. Our own <strong className="text-white">Maída blend</strong> with rose syrup and mastic.
                </p>
                <p>
                  And then there's <strong className="text-white">Cafe Blanc</strong> — not actually coffee at all, but a soothing warm drink with orange blossom water. A Lebanese tradition.
                </p>
                <p className="text-terracotta-light italic">
                  Every cup is an invitation to slow down.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Menu */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-display text-4xl md:text-5xl font-light mb-4 text-charcoal">
              The Menu
            </h2>
            <p className="text-stone">From morning espresso to evening tea</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Coffee */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              <motion.h3 
                className="font-display text-2xl text-charcoal mb-8 pb-4 border-b border-sand"
                variants={fadeInUp}
              >
                Coffee
              </motion.h3>
              <div className="space-y-4">
                {coffeeItems.map((item, index) => (
                  <motion.div 
                    key={index}
                    className={`flex justify-between items-center group ${item.signature ? 'bg-terracotta/5 -mx-4 px-4 py-2 rounded-lg' : ''}`}
                    variants={fadeInUp}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className={`font-display text-lg ${item.signature ? 'text-terracotta' : 'text-charcoal group-hover:text-terracotta'} transition-colors`}>
                        {item.name}
                      </h4>
                      {item.signature && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-terracotta/20 text-terracotta rounded">
                          Signature
                        </span>
                      )}
                    </div>
                    <span className="font-display text-terracotta-light">{item.price}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tea */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              <motion.h3 
                className="font-display text-2xl text-charcoal mb-8 pb-4 border-b border-sand"
                variants={fadeInUp}
              >
                Tea
              </motion.h3>
              <div className="space-y-6">
                {teaItems.map((item, index) => (
                  <motion.div 
                    key={index}
                    className={`flex justify-between items-start group ${item.signature ? 'bg-terracotta/5 -mx-4 px-4 py-3 rounded-lg' : ''}`}
                    variants={fadeInUp}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-display text-lg ${item.signature ? 'text-terracotta' : 'text-charcoal group-hover:text-terracotta'} transition-colors`}>
                          {item.name}
                        </h4>
                        {item.signature && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-terracotta/20 text-terracotta rounded">
                            Signature
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone">{item.description}</p>
                    </div>
                    <span className="font-display text-terracotta-light ml-4">{item.price}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-6 bg-terracotta">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-display text-3xl md:text-4xl font-light mb-4 text-white"
              variants={fadeInUp}
            >
              Your morning table is waiting
            </motion.h2>

            <motion.p 
              className="text-white/80 mb-8"
              variants={fadeInUp}
            >
              Start the day right at Maída
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeInUp}>
              <button
                onClick={handleReserveClick}
                className="btn bg-white text-charcoal hover:bg-sand px-8 py-3"
              >
                Visit Us
              </button>
              <Link
                href={`/${locale}/menu`}
                className="btn bg-charcoal text-white hover:bg-charcoal/80 px-8 py-3"
              >
                View Full Menu
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
