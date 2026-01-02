'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface SAJClientProps {
  translations: any;
  locale: Locale;
}

// SAJ Menu Items
const sajSavoury = [
  { name: "It's Thyme", description: 'Zaatar mix, tomato, cucumber, mint, olives', price: '€6.80', tags: ['V', 'VG'] },
  { name: 'Thyme for Cheese', description: 'Zaatar mix, melted white cheese', price: '€7.50', tags: ['V'] },
  { name: 'Cheesy', description: 'Melted white cheese', price: '€7.60', tags: ['V'] },
  { name: 'Turkey & Cheese', description: 'Smoked turkey, cheese, lettuce, tomato, pickles', price: '€10.20', tags: [] },
  { name: 'Halloumi Bacon', description: 'Halloumi, white cheese, crispy bacon, tomato', price: '€11.60', tags: [] },
  { name: 'What the Feta', description: 'Creamy feta, tomato, arugula, onion, basil', price: '€9.80', tags: ['V'] },
  { name: 'Roasted Veggies', description: 'Eggplant, zucchini, sweet potato, tahini', price: '€9.80', tags: ['V', 'VG'] },
];

const sajSweet = [
  { name: 'The OG', description: 'Melted butter, sugar', price: '€4.20', tags: ['V'] },
  { name: 'Nutella + Banana', description: '', price: '€6.50', tags: ['V'] },
  { name: 'Nutella + Strawberry', description: '', price: '€6.70', tags: ['V'] },
  { name: 'Nutella Mozzarella', description: 'Nutella, melted fresh mozzarella', price: '€7.50', tags: ['V'] },
  { name: 'Berry Compote', description: 'Cream cheese, berry compote, strawberries', price: '€8.00', tags: ['V'] },
  { name: 'Peanut Tahini', description: 'Peanut butter, maple tahini, bananas', price: '€7.00', tags: ['V', 'VG'] },
];

export default function SAJClient({ translations, locale }: SAJClientProps) {
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
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/images/food/dough-ball.webp"
            alt="SAJ bread being prepared"
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
            From Our Griddle
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
                Maída <span className="text-terracotta-light italic">SAJ</span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="text-lg md:text-xl text-sand/90 max-w-xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            The Lebanese flatbread that started it all
          </motion.p>
        </div>
      </section>

      {/* What is SAJ Section */}
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
                What is <span className="text-terracotta italic">SAJ</span>?
              </motion.h2>

              <motion.div className="space-y-6 text-stone text-lg leading-relaxed" variants={fadeInUp}>
                <p>
                  <strong className="text-charcoal">SAJ</strong> (also called Manoushe) is a thin Lebanese flatbread baked on a domed griddle called a <em>saj</em>. The result? Crispy edges, soft center, endless possibilities.
                </p>
                <p>
                  At Maída, we bake ours fresh with <strong className="text-charcoal">100% whole wheat flour</strong> — the traditional way. Each SAJ becomes a canvas for Mediterranean flavors, from classic zaatar to our signature halloumi bacon.
                </p>
                <p className="text-terracotta italic">
                  Watch it bubble on the griddle, smell the wheat toasting, taste the warmth straight from the fire.
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
                  src="/images/food/dough-ball.webp"
                  alt="SAJ dough"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-terracotta/10 rounded-full -z-10" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-sage/20 rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How We Make It */}
      <section className="py-20 md:py-28 px-6 bg-charcoal text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.p 
              className="text-xs tracking-[0.3em] uppercase text-terracotta-light mb-4"
              variants={fadeInUp}
            >
              #FromOurRoots
            </motion.p>

            <motion.h2 
              className="font-display text-4xl md:text-5xl font-light mb-8"
              variants={fadeInUp}
            >
              How we make it
            </motion.h2>

            <motion.div className="space-y-6 text-sand/80 text-lg leading-relaxed max-w-2xl mx-auto" variants={fadeInUp}>
              <p>
                The dough is stretched thin by hand and laid on our hot saj griddle. In minutes, it puffs, bubbles, and transforms into something special.
              </p>
              <p className="text-terracotta-light font-medium">
                No machines. No shortcuts. Just the same technique Lebanese bakers have used for generations.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The SAJ Menu */}
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
              Our SAJ Wraps
            </h2>
            <p className="text-stone">Fresh from the griddle to your table</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Savoury */}
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
                Savoury
              </motion.h3>
              <div className="space-y-6">
                {sajSavoury.map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex justify-between items-start group"
                    variants={fadeInUp}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-display text-lg text-charcoal group-hover:text-terracotta transition-colors">
                          {item.name}
                        </h4>
                        {item.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-sage/20 text-sage rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {item.description && (
                        <p className="text-sm text-stone">{item.description}</p>
                      )}
                    </div>
                    <span className="font-display text-terracotta-light ml-4">{item.price}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Sweet */}
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
                Sweet
              </motion.h3>
              <div className="space-y-6">
                {sajSweet.map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex justify-between items-start group"
                    variants={fadeInUp}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-display text-lg text-charcoal group-hover:text-terracotta transition-colors">
                          {item.name}
                        </h4>
                        {item.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-sage/20 text-sage rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {item.description && (
                        <p className="text-sm text-stone">{item.description}</p>
                      )}
                    </div>
                    <span className="font-display text-terracotta-light ml-4">{item.price}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Note */}
          <motion.p 
            className="text-center text-stone text-sm mt-12 italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            V = Vegetarian · VG = Vegan
          </motion.p>
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
              Come taste it
            </motion.h2>

            <motion.p 
              className="text-white/80 mb-8"
              variants={fadeInUp}
            >
              Fresh SAJ, straight from the griddle
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeInUp}>
              <button
                onClick={handleReserveClick}
                className="btn bg-white text-charcoal hover:bg-sand px-8 py-3"
              >
                Reserve a Table
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
