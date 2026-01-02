'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
  onClick: () => void;
}

export default function CategoryCard({ id, name, image, isActive, onClick }: CategoryCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`category-card flex-shrink-0 w-[140px] md:w-[180px] ${isActive ? 'active' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={name}
          fill
          className="category-card-image"
          sizes="(max-width: 768px) 140px, 180px"
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="category-card-overlay" />
      
      {/* Content */}
      <div className="category-card-content">
        <h3 className="category-card-name">{name}</h3>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-terracotta"
          layoutId="activeCategory"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
