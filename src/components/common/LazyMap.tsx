'use client';

import { useState, useRef, useEffect } from 'react';

interface LazyMapProps {
  src: string;
  title?: string;
  className?: string;
  /**
   * Loading strategy:
   * - 'lazy': Load when component enters viewport (default) - best for homepage
   * - 'eager': Load immediately when component mounts - best for contact page
   */
  loading?: 'lazy' | 'eager';
  /**
   * How far from viewport to start loading (only for lazy mode)
   * Default: 200px - starts loading when map is 200px from being visible
   */
  rootMargin?: string;
}

/**
 * LazyMap - Smart Google Maps iframe loader
 * 
 * Supports two loading strategies:
 * - lazy (default): Defers loading until user scrolls near the map
 * - eager: Loads immediately (for pages where map is primary content)
 * 
 * Usage:
 * 
 * Homepage (lazy - map at bottom):
 * <LazyMap src="..." loading="lazy" />
 * 
 * Contact page (eager - user expects map):
 * <LazyMap src="..." loading="eager" />
 */
export default function LazyMap({ 
  src, 
  title = 'Map', 
  className = '',
  loading = 'lazy',
  rootMargin = '200px'
}: LazyMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If eager loading, we already set shouldLoad to true
    if (loading === 'eager') return;

    const container = containerRef.current;
    if (!container) return;

    // Create Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.unobserve(container);
          }
        });
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [loading, rootMargin]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Placeholder shown before map loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-sand/30 flex items-center justify-center">
          <div className="text-center">
            {/* Loading spinner */}
            <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-stone text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Render iframe when shouldLoad is true */}
      {shouldLoad && (
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
          className={`absolute inset-0 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}
