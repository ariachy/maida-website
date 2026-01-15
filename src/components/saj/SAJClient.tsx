'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface SAJClientProps {
  translations: any;
  locale: Locale;
}

// Featured SAJ Items
const featuredSaj = [
  { 
    name: "It's Thyme", 
    description: 'Zaatar mix, tomato, cucumber, mint, olives',
    tags: ['V', 'VG']
  },
  { 
    name: 'Thyme for Cheese', 
    description: 'Zaatar mix, melted white cheese',
    tags: ['V']
  },
  { 
    name: 'Halloumi Bacon', 
    description: 'Halloumi, white cheese, crispy bacon, tomato, pickles, mayo',
    tags: []
  },
  { 
    name: 'Roasted Veggies', 
    description: 'Eggplant, zucchini, red pepper paste, in-house sweet potato chips, parsley, pomegranate',
    tags: ['V', 'VG']
  },
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
      {/* ============================================
          HERO SECTION - matching other pages
          ============================================ */}
      <section className="relative min-h-[calc(100svh-100px)] md:min-h-[calc(100svh-120px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/saj/dough-ball.webp"
            alt="SAJ bread being prepared"
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
            The art of Lebanese flatbread
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
                Maída <span className="text-terracotta-light italic">SAJ</span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="text-base md:text-xl text-sand/90 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Thin, crispy, impossibly light.
            <br />
            Baked fresh on our custom griddle.
          </motion.p>
        </div>
      </section>

      {/* ============================================
          WHAT IS SAJ? SECTION
          ============================================ */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-display text-4xl md:text-5xl font-light mb-6 text-charcoal">
              What is <span className="text-terracotta italic">SAJ</span>?
            </h2>
            <p className="text-stone text-lg max-w-3xl mx-auto leading-relaxed mb-2">
              SAJ is the traditional Lebanese flatbread - thin, slightly crispy, impossibly light.
            </p>
            <p className="text-stone text-lg max-w-3xl mx-auto leading-relaxed">
              Baked fresh on a custom-made griddle called a <em>saj</em>, it's been the heart of Lebanese mornings for generations.
            </p>
          </motion.div>

          {/* 3 Ways to Enjoy - Visual Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {/* Fresh from the Griddle */}
            <motion.div 
              className="bg-warm-white p-5 text-center"
              variants={fadeInUp}
            >
              <div className="aspect-[4/3] mb-4 bg-sand/30 overflow-hidden">
                <Image
                  src="/images/food/dough-ball.webp"
                  alt="Fresh SAJ bread"
                  width={300}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-lg text-charcoal mb-1">Fresh & Warm from the Griddle</h3>
              <p className="text-stone text-sm">Light, airy, perfect on its own</p>
            </motion.div>

            {/* With Dips & Starters */}
            <motion.div 
              className="bg-warm-white p-5 text-center"
              variants={fadeInUp}
            >
              <div className="aspect-[4/3] mb-4 bg-sand/30 overflow-hidden">
                <Image
                  src="/images/food/dough-ball.webp"
                  alt="SAJ with dips"
                  width={300}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-lg text-charcoal mb-1">With Dips & Starters</h3>
              <p className="text-stone text-sm">Hummus, Muhamara, labneh - perfect for scooping</p>
            </motion.div>

            {/* Bread for Mains */}
            <motion.div 
              className="bg-warm-white p-5 text-center"
              variants={fadeInUp}
            >
              <div className="aspect-[4/3] mb-4 bg-sand/30 overflow-hidden">
                <Image
                  src="/images/food/dough-ball.webp"
                  alt="SAJ with shawarma"
                  width={300}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-lg text-charcoal mb-1">Bread for Mains</h3>
              <p className="text-stone text-sm">The perfect companion for shawarma & grilled meats</p>
            </motion.div>
          </motion.div>

          {/* Manoushe Section - With Image */}
          <motion.div 
            className="grid md:grid-cols-2 gap-0 overflow-hidden max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Image Side */}
            <div className="h-64 md:h-80 bg-sand/30 overflow-hidden">
              <Image
                src="/images/saj/wraps.webp"
                alt="Manoushe - SAJ with toppings"
                width={400}
                height={320}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content Side */}
            <div className="bg-charcoal text-white p-6 md:p-8 flex flex-col justify-center h-64 md:h-80">
              <p className="text-xs tracking-[0.3em] uppercase text-terracotta-light mb-3">And then there's</p>
              <h3 className="font-display text-2xl md:text-3xl italic text-white mb-4">Manoushe</h3>
              <p className="text-sand/80 text-base leading-relaxed mb-4">
                What happens when SAJ meets toppings - zaatar with olive oil, cheese, labneh.
              </p>
              <div className="flex flex-col gap-1 text-sand/60 text-sm">
                <span>In Lebanon, it's breakfast.</span>
                <span>It's a quick lunch.</span>
                <span>It's the smell of every neighborhood bakery.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          THE SOUL OF OUR TEXTURE SECTION
          ============================================ */}
      <section className="py-20 md:py-28 px-6 bg-sand/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Image Placeholder */}
            <motion.div
              className="relative order-2 md:order-1"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-[4/5] overflow-hidden bg-stone/20">
                {/* Placeholder - replace with Anna/griddle image */}
                <Image
                  src="/images/food/dough-ball.webp"
                  alt="Anna preparing SAJ on the griddle"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="order-1 md:order-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.p 
                className="text-xs tracking-[0.3em] uppercase text-terracotta mb-4"
                variants={fadeInUp}
              >
                Our Process
              </motion.p>

              <motion.h2 
                className="font-display text-3xl md:text-4xl font-light mb-8 text-charcoal"
                variants={fadeInUp}
              >
                The Soul of Our<br />
                <span className="text-terracotta italic">Texture and Flavor</span>
              </motion.h2>

              <motion.div className="space-y-5 text-stone text-base leading-relaxed" variants={fadeInUp}>
                <p>
                  Our wholewheat SAJ bread is the result of months of dedication and refinement by our chef, Anna, who was determined to create a more modern version without compromising authenticity.
                </p>
                <p>
                  Made from a blend of wholewheat flour and natural ingredients, this recipe stays true to tradition while offering a richer, earthier flavor and a beautifully soft texture.
                </p>
                <p>
                  Every piece is stretched and baked fresh on our custom-made burner - ensuring consistent heat for that perfect crisp outside and pillowy inside, just as it has been for generations. Only now, with Anna's signature touch.
                </p>
                <p className="text-terracotta italic font-medium">
                  The moment it leaves the griddle, the warm aroma fills the room - there's nothing quite like fresh SAJ.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED SAJ ITEMS SECTION
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
              Featured <span className="text-terracotta italic">SAJ</span>
            </h2>
            <p className="text-stone text-lg max-w-2xl mx-auto">
              At Maída, we honor the tradition while adding our own twist - from classic zaatar to halloumi & bacon, turkey & cheese, roasted veggies.
            </p>
          </motion.div>

          {/* Featured Items Grid */}
          <motion.div 
            className="grid sm:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {featuredSaj.map((item, index) => (
              <motion.div 
                key={index}
                className="bg-cream p-6 md:p-8 border border-sand/50 hover:border-terracotta/30 transition-colors"
                variants={fadeInUp}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-display text-xl text-charcoal">{item.name}</h3>
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 shrink-0">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 bg-sage/20 text-sage font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-stone text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href={`/${locale}/menu`}
              className="inline-block bg-terracotta text-warm-white px-8 py-3 font-medium hover:bg-terracotta/90 transition-colors"
            >
              View Saj Menu
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          PERFECT PAIRINGS SECTION - Simple & Clean
          ============================================ */}
      <section className="py-16 md:py-20 px-6 bg-cream">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-display text-4xl md:text-5xl font-light mb-6 text-charcoal"
              variants={fadeInUp}
            >
              SAJ is <span className="text-terracotta italic">always</span> a good idea.
            </motion.h2>

            <motion.p 
              className="text-stone text-lg leading-relaxed mb-8"
              variants={fadeInUp}
            >
              Enjoy our SAJ with our selection of dips, as a side, or simply on its own with our combination of toppings.
            </motion.p>

            <motion.div 
              className="bg-sand/50 p-6 md:p-8 max-w-xl mx-auto"
              variants={fadeInUp}
            >
              <p className="text-charcoal text-lg leading-relaxed mb-4">
                Pair it with fresh juice, coffee, beer, or any drink you fancy.
              </p>
              <Link
                href={`/${locale}/menu#drinks`}
                className="inline-flex items-center gap-2 text-terracotta font-medium hover:underline"
              >
                Explore our drinks
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
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
            Fresh from the griddle to your table
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
