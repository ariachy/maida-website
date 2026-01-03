'use client';

import { motion } from 'framer-motion';

interface MenuItemProps {
  name: string;
  description: string;
  price: number;
  priceBottle?: number;
  tags: string[];
  tagLabels: Record<string, string>;
  glassLabel?: string;
  bottleLabel?: string;
  onClick?: () => void;
}

// Format price without € sign
const formatPrice = (price: number): string => {
  // Show decimal only if not a whole number
  return price % 1 === 0 ? price.toString() : price.toFixed(1);
};

export default function MenuItem({
  name,
  description,
  price,
  priceBottle,
  tags,
  tagLabels,
  glassLabel = 'glass',
  bottleLabel = 'bottle',
  onClick,
}: MenuItemProps) {
  return (
    <motion.div
      className="group py-2.5 border-b border-sand/30 cursor-pointer"
      onClick={onClick}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Name row with price */}
      <div className="flex justify-between items-baseline gap-2">
        <div className="flex items-baseline gap-2 flex-wrap flex-1 min-w-0">
          <h4 className="font-display text-lg md:text-xl text-charcoal group-hover:text-terracotta transition-colors duration-200 leading-tight">
            {name}
          </h4>
          {tags.length > 0 && (
            <div className="flex gap-1">
              {tags.map((tag) => (
                <span 
                  key={tag} 
                  className="text-[9px] px-1 py-0.5 bg-sage/20 text-sage font-medium"
                >
                  {tagLabels[tag] || tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Price - right next to name */}
        <div className="shrink-0 text-right">
          {priceBottle ? (
            <span className="font-display text-base text-terracotta">
              {formatPrice(price)} / {formatPrice(priceBottle)}
            </span>
          ) : (
            <span className="font-display text-lg text-terracotta">
              {formatPrice(price)}
            </span>
          )}
        </div>
      </div>
      
      {/* Description row */}
      {description && (
        <p className="text-sm text-stone mt-0.5 leading-relaxed">{description}</p>
      )}
      
      {/* Glass/Bottle labels for wine */}
      {priceBottle && (
        <p className="text-xs text-stone/70 mt-0.5">
          {glassLabel} / {bottleLabel}
        </p>
      )}
    </motion.div>
  );
}
