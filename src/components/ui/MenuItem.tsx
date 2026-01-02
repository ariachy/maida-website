'use client';

import { motion } from 'framer-motion';
import { formatPriceSimple } from '@/lib/utils';

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

export default function MenuItem({
  name,
  description,
  price,
  priceBottle,
  tags,
  tagLabels,
  glassLabel,
  bottleLabel,
  onClick,
}: MenuItemProps) {
  return (
    <motion.div
      className="menu-item-line group cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h4 className="menu-item-name">{name}</h4>
          {tags.length > 0 && (
            <div className="flex gap-1">
              {tags.map((tag) => (
                <span key={tag} className="tag">
                  {tagLabels[tag] || tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="menu-item-description">{description}</p>
      </div>
      
      <div className="menu-item-price flex flex-col items-end">
        {priceBottle ? (
          <>
            <span className="text-sm text-stone">
              {glassLabel}: {formatPriceSimple(price)}
            </span>
            <span>
              {bottleLabel}: {formatPriceSimple(priceBottle)}
            </span>
          </>
        ) : (
          <span>{formatPriceSimple(price)}</span>
        )}
      </div>
    </motion.div>
  );
}
