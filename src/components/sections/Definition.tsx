'use client';

import { motion } from 'framer-motion';

interface DefinitionProps {
  translations?: any;
}

export default function Definition({ translations }: DefinitionProps) {
  return (
    <section className="py-12 md:py-16 bg-warm-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Terracotta Card with Emblem Pattern */}
          <div className="relative bg-terracotta overflow-hidden">
            {/* Emblem Pattern Background - subtle */}
            <div 
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `url('/images/brand/emblem.svg')`,
                backgroundSize: '60px',
                backgroundRepeat: 'repeat',
              }}
            />
            
            {/* Content */}
            <div className="relative z-10 py-10 md:py-14 px-6 md:px-12 text-center">
              {/* Arabic word */}
              <p className="font-display text-4xl md:text-5xl text-warm-white mb-2 arabic-text">
                مائدة
              </p>
              
              {/* Phonetic and type */}
              <p className="text-sm text-warm-white/70 mb-4">
                [al-māʾidah] <span className="italic">(noun)</span>
              </p>
              
              {/* Definition */}
              <p className="text-base md:text-lg text-warm-white/90 leading-relaxed max-w-xl mx-auto font-light">
                A communal table; a place where food, stories, and connection come together. 
                A symbol of generosity, community, and togetherness.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
