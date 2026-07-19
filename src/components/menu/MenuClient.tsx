'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface InlineTranslation {
  name?: string;
  description?: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  sortOrder: number;
  subCategory?: string;
  active?: boolean; // Phase 0: undefined or true = visible; false = hidden
  en?: InlineTranslation;
  pt?: InlineTranslation;
}

interface SubCategoryRecord {
  id: string;
  categoryId: string;
  sortOrder: number;
}

interface MenuClientProps {
  translations: any;
  menuData: {
    categories: Array<{ id: string; slug: string; image: string; sortOrder: number }>;
    subCategories?: Array<SubCategoryRecord>;
    items: Array<MenuItem>;
  };
  locale: string;
}

// Sub-category GROUPS and their order now come from menuData.subCategories (records
// with their own sortOrder). Item order within a group comes from item.sortOrder.
// Inactive items (active === false) are hidden. `couvert` renders as a boxed section
// at the top of its category, matching the existing design. Falls back gracefully if
// the subCategories records are absent (old data).

export default function MenuClient({ translations, menuData, locale }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState(menuData.categories[0]?.id || '');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const { menu } = translations;
  const { categories, items } = menuData;
  const subCategoryRecords: SubCategoryRecord[] = menuData.subCategories || [];

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleCategoryClick = (categoryId: string) => setActiveCategory(categoryId);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category') || hash;
    if (categoryParam) {
      const category = categories.find((c) => c.slug === categoryParam);
      if (category) setActiveCategory(category.id);
    }
  }, [categories]);

  // ---- Visibility ----
  // Strict: an item must opt IN. Every live item now carries `active: true`
  // explicitly (menu.json), so a new item cannot leak onto the page just because
  // someone forgot the flag.
  const isVisible = (item: MenuItem) => item.active === true;

  // ---- Grouping helpers ----
  const itemsInCategory = (categoryId: string) =>
    items
      .filter((i) => i.categoryId === categoryId && isVisible(i))
      .sort((a, b) => a.sortOrder - b.sortOrder);

  // Ordered sub-category ids for a category (excludes 'couvert', which renders
  // separately). Prefers the subCategories records; falls back to deriving from items.
  const orderedSubCategoryIds = (categoryId: string): string[] => {
    const recs = subCategoryRecords
      .filter((s) => s.categoryId === categoryId && s.id !== 'couvert')
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => s.id);
    if (recs.length) return recs;

    // Fallback: derive from items by lowest sortOrder.
    const minOrder: Record<string, number> = {};
    for (const it of items) {
      if (it.categoryId !== categoryId || !isVisible(it)) continue;
      const sc = it.subCategory;
      if (!sc || sc === 'couvert') continue;
      minOrder[sc] = minOrder[sc] === undefined ? it.sortOrder : Math.min(minOrder[sc], it.sortOrder);
    }
    return Object.keys(minOrder).sort((a, b) => minOrder[a] - minOrder[b]);
  };

  const itemsForSubCategory = (categoryId: string, subId: string) =>
    items
      .filter((i) => i.categoryId === categoryId && i.subCategory === subId && isVisible(i))
      .sort((a, b) => a.sortOrder - b.sortOrder);

  const ungroupedItems = (categoryId: string) =>
    items
      .filter((i) => i.categoryId === categoryId && !i.subCategory && isVisible(i))
      .sort((a, b) => a.sortOrder - b.sortOrder);

  // Resolution order, per field, independently:
  //   1. item[locale]              — a deliberate per-item override for THIS locale
  //   2. translations[locale].items — the locale dictionary (the normal source)
  //   3. item.en                    — last resort only, so an English string can never
  //                                   silently win on the Portuguese page
  //   4. humanised id               — visible-broken, better than blank
  //
  // The old order was item[locale] -> item.en -> dictionary, which let a stale
  // per-item override shadow a corrected translation, and let English render on /pt.
  // `name` and `description` resolve separately so a pt.name override cannot drag an
  // en.description along with it.
  const resolveField = (item: MenuItem, field: 'name' | 'description'): string | undefined => {
    const own = (item as any)[locale]?.[field];
    if (own) return own;
    const dict = menu?.items?.[item.id]?.[field];
    if (dict) return dict;
    return item.en?.[field];
  };

  const getName = (item: MenuItem) =>
    resolveField(item, 'name') || item.id.replace(/-/g, ' ');

  const getDescription = (item: MenuItem) => resolveField(item, 'description') || '';
  const subCategoryName = (subId: string) =>
    menu?.subCategories?.[subId] || subId.replace(/-/g, ' ');

  // ---- Scroll arrows ----
  const updateScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const hasOverflow = scrollWidth > clientWidth + 10;
      setShowLeftArrow(hasOverflow && scrollLeft > 10);
      setShowRightArrow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      updateScrollState();
      window.addEventListener('resize', updateScrollState);
      return () => {
        container.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
      };
    }
  }, []);

  const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

  // ---- Renderers ----
  const renderItems = (itemsList: MenuItem[], compact = false) => {
    if (compact) {
      return (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
          {itemsList.map((item) => {
            const name = getName(item);
            const description = getDescription(item);
            return (
              <span key={item.id} className="text-charcoal text-sm py-1">
                {name}
                {description && <span className="text-stone text-xs ml-1">({description})</span>}
              </span>
            );
          })}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-4">
        {itemsList.map((item) => {
          const name = getName(item);
          const description = getDescription(item);
          return (
            <div key={item.id} className="py-1.5 text-center">
              <h3 className="font-display text-base md:text-lg text-charcoal font-medium">
                {name}
              </h3>
              {description && (
                <p className="text-stone text-sm mt-0.5 leading-snug">{description}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCouvertBox = (categoryId: string) => {
    let couvertItems = items
      .filter((i) => i.categoryId === categoryId && i.subCategory === 'couvert' && isVisible(i))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    if (couvertItems.length === 0) return null;

    const couvertOrder = ['marinated-olives', 'saj-crackers', 'zaatar-mix-crackers', 'saj-bread'];
    couvertItems = [...couvertItems].sort((a, b) => {
      const ai = couvertOrder.indexOf(a.id);
      const bi = couvertOrder.indexOf(b.id);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    const couvertName = menu?.subCategories?.couvert || 'Couvert';

    return (
      <div className="relative mb-12 mt-2">
        <div className="text-center mb-3">
          <h3 className="text-base uppercase tracking-[0.2em] text-terracotta/80 font-bold">
            {couvertName}
          </h3>
        </div>
        <div className="border border-terracotta/25 px-4 py-3">
          <p className="text-center text-charcoal text-sm leading-relaxed">
            {couvertItems.map((item, index) => (
              <span key={item.id} className="whitespace-nowrap inline-block">
                {index > 0 && <span className="text-terracotta/40 mx-2">·</span>}
                {getName(item)}
              </span>
            ))}
          </p>
        </div>
      </div>
    );
  };

  const renderSubCategory = (categoryId: string, subId: string, isFirst: boolean, isCompact: boolean) => {
    const subCatItems = itemsForSubCategory(categoryId, subId);
    if (subCatItems.length === 0) return null;
    return (
      <div key={subId} className={isFirst ? '' : isCompact ? 'mt-6' : 'mt-10'}>
        <h3 className="text-center text-base uppercase tracking-[0.2em] text-terracotta/80 mb-4 font-bold">
          {subCategoryName(subId)}
        </h3>
        {renderItems(subCatItems, isCompact)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* HEADER */}
      <section className="pt-28 md:pt-32 pb-6 md:pb-8 px-6 bg-warm-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {menu?.heroTitle || 'Our Menu'}
          </motion.h1>
          <motion.p
            className="text-stone text-base md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {menu?.heroSubtitle || 'Mediterranean flavours. Lebanese soul.'}
          </motion.p>
          <motion.div
            className="relative flex items-center justify-center gap-4 px-6 pb-4 overflow-hidden mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="relative w-16 md:w-24 h-px bg-terracotta/30" />
            <Image src="/images/brand/emblem.svg" alt="" width={20} height={20} className="relative opacity-50" />
            <span className="relative w-16 md:w-24 h-px bg-terracotta/30" />
          </motion.div>
        </div>
      </section>

      {/* CATEGORY SELECTOR */}
      <div className="sticky top-[72px] md:top-[80px] z-40 bg-warm-white/95 backdrop-blur-sm border-b border-stone/10">
        <div className="max-w-4xl mx-auto relative py-3 px-4">
          <AnimatePresence>
            {showLeftArrow && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-warm-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-warm-white transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          <div
            ref={scrollContainerRef}
            className="flex md:justify-center gap-2 overflow-x-auto scrollbar-hide px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {sortedCategories.map((category) => {
              const isActive = activeCategory === category.id;
              const categoryName = menu?.categories?.[category.id]?.name || category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive ? 'bg-terracotta text-warm-white' : 'bg-sand text-charcoal hover:bg-terracotta/10 hover:text-terracotta'
                  }`}
                >
                  {categoryName}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-warm-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-charcoal hover:bg-terracotta hover:text-warm-white transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MENU ITEMS */}
      <div className="py-6 md:py-10 px-4 bg-sand/30">
        <div className="max-w-3xl mx-auto">
          <div
            className="relative border border-stone/10 shadow-lg overflow-hidden"
            style={{ background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.3]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.03)' }} />
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-terracotta/20 pointer-events-none" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-terracotta/20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-terracotta/20 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-terracotta/20 pointer-events-none" />

            <div className="relative px-8 md:px-12 py-10 md:py-12">
              {sortedCategories.map((category) => {
                const categoryItems = itemsInCategory(category.id);
                const isActive = activeCategory === category.id;
                const isCompact = category.id === 'drinks';
                const subIds = orderedSubCategoryIds(category.id);
                const ungrouped = ungroupedItems(category.id);

                return (
                  <div key={category.id} className={isActive ? 'block' : 'hidden'} aria-hidden={!isActive}>
                    <div className="flex items-center justify-center mb-8">
                      <div className="w-12 h-px bg-terracotta/40" />
                      <div className="mx-3">
                        <Image src="/images/brand/emblem.svg" alt="" width={16} height={16} className="opacity-50" />
                      </div>
                      <div className="w-12 h-px bg-terracotta/40" />
                    </div>

                    {/* Couvert box */}
                    {renderCouvertBox(category.id)}

                    {/* Ungrouped items first (categories with no sub-categories) */}
                    {ungrouped.length > 0 && renderItems(ungrouped, isCompact)}

                    {/* Then each sub-category group, in records order */}
                    {subIds.map((subId, index) =>
                      renderSubCategory(category.id, subId, index === 0 && ungrouped.length === 0, isCompact)
                    )}

                    {categoryItems.length === 0 && (
                      <p className="text-center text-stone py-12">
                        {menu?.emptyCategory || 'No items in this category yet.'}
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="mt-10 pt-6 border-t border-stone/20">
                <p className="text-center text-stone text-sm italic">
                  {menu?.allergenNote || 'Please ask our team about allergens and dietary requirements.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
