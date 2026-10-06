'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, ChevronRight } from 'lucide-react';
import { track } from '@/lib/analytics';
import { useBooking } from '@/hooks/useBooking';

/* ------------------------------------------------------------------------------------
 * Menu page in the style of the printed menu (Oct 2026 PDFs).
 *
 * Data model (src/data/menu.json):
 *  - pages[]            : the top-level switch (Food, SAJ Wraps, Alcoholic, Non-alcoholic,
 *                         Wines). Each page has a layout of "blocks" for the desktop
 *                         two-column composition: left / right / bottom. A block is a
 *                         category id ("starters") or a sub-category ref ("starters/couvert").
 *  - categories[].page  : which page a category belongs to (used for anything a layout
 *                         does not reference explicitly, e.g. a category added in the admin).
 *  - categories[].headless : the category title is not printed; its sub-categories are
 *                         printed as top-level sections (Classics / Maída's, Coffee · Tea …).
 *  - subCategories[].boxed : the section gets the framed box of the PDF.
 *  - items[].price      : in €, printed as "10,5" like the PDF.
 *
 * Desktop (lg and up): the page's blocks in two columns + a full-width bottom strip, no
 * jump bar — the whole page is visible, as on paper. Below lg: one column in reading
 * order, a sticky jump bar that follows the scroll, and a back-to-top button.
 * ---------------------------------------------------------------------------------- */

interface InlineTranslation {
  name?: string;
  description?: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  sortOrder: number;
  subCategory?: string;
  active?: boolean;
  price?: number; // glass price for wines
  priceBottle?: number; // wines: bottle price
  en?: InlineTranslation;
  pt?: InlineTranslation;
}

interface Category {
  id: string;
  slug: string;
  image: string;
  sortOrder: number;
  page?: string;
  headless?: boolean;
  printNote?: boolean; // print the category description under the title (ARAK sizes)
  subheadingTone?: 'accent'; // wines: red, upright sub-headings (WHITE, RED, ROSÉ…)
  priceColumns?: boolean; // wines: glass | bottle columns with a header row
}

interface SubCategoryRecord {
  id: string;
  categoryId: string;
  sortOrder: number;
  boxed?: boolean;
  columns?: 1 | 2; // compact lists: 1 = single stack (Soft Drinks on the PDF), default 2
}

interface PageLayout {
  left?: string[];
  right?: string[];
  bottom?: string[];
}

interface PageRecord {
  id: string;
  sortOrder: number;
  layout?: PageLayout;
  active?: boolean; // false = page switched off (SAJ Wraps for now)
}

interface MenuClientProps {
  translations: any;
  menuData: {
    categories: Category[];
    subCategories?: SubCategoryRecord[];
    pages?: PageRecord[];
    items: MenuItem[];
  };
  locale: string;
}

/** A printable section: a whole category (with its sub-sections) or one sub-category. */
interface Block {
  key: string; // "starters" | "starters/couvert"
  title: string;
  categoryId: string;
  subId?: string;
  items: MenuItem[]; // direct items (for a category block: items without sub-category)
  subSections: { id: string; title: string; items: MenuItem[]; boxed: boolean; columns?: 1 | 2 }[];
  columns?: 1 | 2;
  boxed: boolean;
  note?: string; // category description, printed under the title (ARAK sizes)
  accentSubheadings?: boolean;
  priceColumns?: boolean;
  isCouvertStrip: boolean;
  isStrip?: boolean; // bottom blocks print as one inline line, like the PDF
}

const NAVBAR_OFFSET = 72; // px, matches the sticky Navbar height on small screens

// "10,5" / "14" — the printed menu's format; the footer says prices are in €.
const formatPrice = (price: number) =>
  (Number.isInteger(price) ? String(price) : price.toFixed(1)).replace('.', ',');

const hasPrice = (i: MenuItem) => typeof i.price === 'number' && i.price > 0;

// "SHISH BARAK (house specialty)" -> ["SHISH BARAK", "house specialty", ""]
// "SAJ (baked in-house) bread or crackers" -> ["SAJ", "baked in-house", "bread or crackers"]
const splitName = (name: string): [string, string | undefined, string] => {
  const m = name.match(/^(.*?)\s*\((.*?)\)\s*(.*)$/);
  return m ? [m[1], m[2], m[3]] : [name, undefined, ''];
};

const GREEN_PAGES = new Set(['alcoholic', 'non-alcoholic', 'wines']);

// On the drinks sheets only "callout" notes are red — (specialty) — while descriptive
// notes like (30cl) or (0% alcohol) stay in the item colour. On the food sheet every
// note is red.
const isCallout = (note: string) => /specialty|especialidade|favourite|favorite|favorito/i.test(note);

export default function MenuClient({ translations, menuData, locale }: MenuClientProps) {
  const { menu } = translations;
  const { categories, items } = menuData;
  const subRecords: SubCategoryRecord[] = menuData.subCategories || [];
  const { openWidget, isOpening } = useBooking(locale);

  // ---------- text resolution (locale dictionary first, inline override as fallback) ----------
  const resolveField = (item: MenuItem, field: 'name' | 'description'): string | undefined => {
    const own = (item as any)[locale]?.[field];
    if (own) return own;
    const dict = menu?.items?.[item.id]?.[field];
    if (dict) return dict;
    return item.en?.[field];
  };
  const getName = (item: MenuItem) => resolveField(item, 'name') || item.id.replace(/-/g, ' ');
  const getDescription = (item: MenuItem) => resolveField(item, 'description') || '';
  const categoryName = (id: string) => menu?.categories?.[id]?.name || id.replace(/-/g, ' ');
  const categoryNote = (id: string) => menu?.categories?.[id]?.description || '';
  const subName = (id: string) => menu?.subCategories?.[id] || id.replace(/-/g, ' ');
  const pageName = (id: string) => menu?.pages?.[id] || id.replace(/-/g, ' ');

  const isLive = (i: MenuItem) => i.active !== false;

  // ---------- pages ----------
  const pages: PageRecord[] = useMemo(() => {
    if (menuData.pages && menuData.pages.length) {
      return [...menuData.pages].filter((p) => p.active !== false).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    // Old data without pages: one page per category, in category order.
    return [...categories]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c, i) => ({ id: c.id, sortOrder: i + 1, layout: { left: [c.id] } }));
  }, [menuData.pages, categories]);

  const [activePage, setActivePage] = useState(pages[0]?.id || '');
  const [activeSection, setActiveSection] = useState('');
  const [showTop, setShowTop] = useState(false);
  const tone = GREEN_PAGES.has(activePage) ? 'green' : 'red';

  // ---------- blocks ----------
  const subsOf = (categoryId: string) =>
    subRecords.filter((s) => s.categoryId === categoryId).sort((a, b) => a.sortOrder - b.sortOrder);

  const itemsOf = (categoryId: string, subId?: string) =>
    items
      .filter((i) => i.categoryId === categoryId && isLive(i) && (i.subCategory || undefined) === subId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

  /** Build the printable blocks for a page, in reading order (left, right, bottom). */
  const buildPage = (page: PageRecord) => {
    const layout = page.layout || {};
    const refs = {
      left: layout.left || [],
      right: layout.right || [],
      bottom: layout.bottom || [],
    };
    const referenced = new Set([...refs.left, ...refs.right, ...refs.bottom]);
    const referencedSubs = new Set(
      Array.from(referenced).filter((r) => r.includes('/')).map((r) => r.split('/')[1])
    );

    // Categories that belong to this page but are not placed by the layout (e.g. added
    // later in the admin) go to whichever column is shorter.
    categories
      .filter((c) => (c.page || pages[0]?.id) === page.id && !referenced.has(c.id))
      .filter((c) => !subsOf(c.id).some((s) => referenced.has(`${c.id}/${s.id}`)))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((c) => (refs.left.length <= refs.right.length ? refs.left : refs.right).push(c.id));

    const makeBlock = (ref: string): Block | null => {
      const [categoryId, subId] = ref.split('/');
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return null;

      if (subId) {
        const rec = subRecords.find((s) => s.categoryId === categoryId && s.id === subId);
        const blockItems = itemsOf(categoryId, subId);
        if (blockItems.length === 0) return null;
        return {
          key: ref,
          title: subName(subId),
          categoryId,
          subId,
          items: blockItems,
          subSections: [],
          boxed: !!rec?.boxed,
          columns: rec?.columns,
          isCouvertStrip: subId === 'couvert',
        };
      }

      // Whole category. Sub-categories placed elsewhere on this page are left out here.
      const subSections = subsOf(categoryId)
        .filter((s) => !referencedSubs.has(s.id))
        .map((s) => ({ id: s.id, title: subName(s.id), items: itemsOf(categoryId, s.id), boxed: !!s.boxed, columns: s.columns }))
        .filter((s) => s.items.length > 0);
      const direct = itemsOf(categoryId, undefined);
      if (direct.length === 0 && subSections.length === 0) return null;

      if (category.headless) {
        // Each sub-category is its own top-level section.
        return {
          key: ref,
          title: '',
          categoryId,
          items: direct,
          subSections,
          boxed: false,
          isCouvertStrip: false,
        };
      }
      return {
        key: ref,
        title: categoryName(categoryId),
        categoryId,
        items: direct,
        subSections,
        boxed: false,
        note: category.printNote ? categoryNote(categoryId) || undefined : undefined,
        accentSubheadings: category.subheadingTone === 'accent',
        priceColumns: !!category.priceColumns,
        isCouvertStrip: false,
      };
    };

    const build = (list: string[]) => list.map(makeBlock).filter((b): b is Block => !!b);
    const left = build(refs.left);
    const right = build(refs.right);
    const bottom = build(refs.bottom);

    // Headless categories expand into one jump entry per sub-section.
    const expand = (blocks: Block[]): Block[] =>
      blocks.flatMap((b) =>
        b.title === '' && b.subSections.length
          ? b.subSections.map((s) => ({
              key: `${b.categoryId}/${s.id}`,
              title: s.title,
              categoryId: b.categoryId,
              subId: s.id,
              items: s.items,
              subSections: [],
              boxed: s.boxed,
              columns: s.columns,
              isCouvertStrip: false,
            }))
          : [b]
      );

    return { left: expand(left), right: expand(right), bottom: expand(bottom).map((b) => ({ ...b, isStrip: true })) };
  };

  const pageBlocks = useMemo(
    () => Object.fromEntries(pages.map((p) => [p.id, buildPage(p)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pages, categories, subRecords, items, locale]
  );

  const current = pageBlocks[activePage] || { left: [], right: [], bottom: [] };
  const readingOrder = [...current.left, ...current.right, ...current.bottom];
  const sectionId = (block: Block) => `menu-${block.key.replace('/', '--')}`;

  // ---------- page switch ----------
  const topRef = useRef<HTMLDivElement>(null);
  const handlePage = (id: string) => {
    if (id === activePage) return;
    setActivePage(id);
    setActiveSection('');
    track('menu_category_view', { menu_category: id, locale });
    // Bring the switch back into view so the new page starts at its top.
    requestAnimationFrame(() => {
      const top = topRef.current?.getBoundingClientRect().top ?? 0;
      if (top < NAVBAR_OFFSET) {
        window.scrollTo({ top: window.scrollY + top - NAVBAR_OFFSET - 8, behavior: 'auto' });
      }
    });
  };

  // ---------- mobile: jump bar scroll-spy + back-to-top ----------
  const jumpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = readingOrder.map(sectionId);
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveSection(visible[0].target.id);
      },
      { rootMargin: `-${NAVBAR_OFFSET + 56}px 0px -55% 0px`, threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, locale]);

  useEffect(() => {
    // Keep the active jump link in view inside the scrolling bar.
    const link = jumpRef.current?.querySelector<HTMLElement>(`[data-target="${activeSection}"]`);
    link?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeSection]);

  // Right-edge fade on the jump bar while there is more to the right.
  const [jumpMore, setJumpMore] = useState(false);
  useEffect(() => {
    const ul = jumpRef.current?.querySelector('ul');
    if (!ul) return;
    const check = () => setJumpMore(ul.scrollWidth - ul.clientWidth - ul.scrollLeft > 8);
    check();
    ul.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      ul.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [activePage, readingOrder.length]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ---------- renderers ----------
  const noteClass = (note: string) => (tone === 'green' && !isCallout(note) ? T.text : T.note);

  const renderItem = (item: MenuItem, compact: boolean) => {
    const [name, note, rest] = splitName(getName(item));
    const description = getDescription(item);
    if (compact) {
      // Lists without descriptions (coffee, soft drinks, beers): name left, price right.
      return (
        <div key={item.id} className="py-[3px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">
              <span className="font-semibold text-[12.5px] lg:text-[13px] tracking-[0.1em] uppercase">{name}</span>
              {note && <span className={`italic text-[12px] lg:text-[12.5px] ml-1 ${noteClass(note)}`}>({note})</span>}
              {rest && <span className="font-light text-[12.5px] lg:text-[13px] ml-1">{rest}</span>}
            </span>
            {hasPrice(item) && (
              <span className="font-light text-[13px] lg:text-[14px] tabular-nums whitespace-nowrap">{formatPrice(item.price!)}</span>
            )}
          </div>
          {description && <p className="font-light italic text-[12px] lg:text-[12.5px] leading-[1.3] -mt-px">{description}</p>}
        </div>
      );
    }
    return (
      <div key={item.id} className="py-[5px]">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-[13.5px] lg:text-[15px] tracking-[0.14em] uppercase">{name}</span>
          {note && <span className={`italic text-[13px] lg:text-[14.5px] ${noteClass(note)}`}>({note})</span>}
          {rest && <span className="font-light text-[14px] lg:text-[15.5px]">{rest}</span>}
          {hasPrice(item) && (
            <span className="font-light text-[14px] lg:text-[15.5px] tabular-nums whitespace-nowrap">{formatPrice(item.price!)}</span>
          )}
        </div>
        {description && <p className="font-light text-[14px] lg:text-[15.5px] leading-[1.35] mt-px max-w-[46ch]">{description}</p>}
      </div>
    );
  };

  // Wine row: name and region on the left, glass | bottle on the right.
  const getRegion = (item: MenuItem): string =>
    (item as any)[locale]?.region || menu?.items?.[item.id]?.region || '';

  const renderWineRow = (item: MenuItem) => {
    const [name, note] = splitName(getName(item));
    const region = getRegion(item);
    const description = getDescription(item);
    const cell = 'w-10 lg:w-12 text-right font-light text-[14px] lg:text-[15.5px] tabular-nums';
    return (
      <div key={item.id} className="flex items-start gap-4 py-[6px]">
        <div className="min-w-0 flex-1">
          <p className="leading-snug">
            <span className="font-semibold text-[13.5px] lg:text-[15px] tracking-[0.14em] uppercase">{name}</span>
            {note && <span className="italic text-[13px] lg:text-[14px] ml-1.5">({note})</span>}
            {region && <span className="italic text-[13px] lg:text-[14px] ml-2">{region}</span>}
          </p>
          {description && <p className="font-light text-[14px] lg:text-[15.5px] leading-[1.35] mt-px max-w-[60ch]">{description}</p>}
        </div>
        <div className="flex gap-3 flex-shrink-0 pt-px">
          <span className={cell}>{hasPrice(item) ? formatPrice(item.price!) : '—'}</span>
          <span className={cell}>{typeof item.priceBottle === 'number' ? formatPrice(item.priceBottle) : ''}</span>
        </div>
      </div>
    );
  };

  const renderPriceHeader = () => (
    <div className={`flex justify-end gap-3 mb-1 ${T.note}`}>
      <span className="w-10 lg:w-12 text-right italic text-[12px] lg:text-[13px]">{menu?.glass || 'glass'}</span>
      <span className="w-10 lg:w-12 text-right italic text-[12px] lg:text-[13px]">{menu?.bottle || 'bottle'}</span>
    </div>
  );

  const isCompactList = (list: MenuItem[]) =>
    list.length > 2 && list.filter((i) => !getDescription(i)).length >= Math.ceil(list.length * 0.75);

  // Compact lists fill two columns top-to-bottom like the printed sheet: the first half
  // of the list stacks on the left, the second half on the right.
  const renderItems = (list: MenuItem[], columns: 1 | 2 = 2) => {
    const compact = isCompactList(list);
    if (!compact) return <div className={T.text}>{list.map((i) => renderItem(i, false))}</div>;
    if (columns === 1) return <div className={T.text}>{list.map((i) => renderItem(i, true))}</div>;
    const half = Math.ceil(list.length / 2);
    const cols = [list.slice(0, half), list.slice(half)];
    return (
      <div className={`${T.text} grid grid-cols-1 sm:grid-cols-2 gap-x-6`}>
        {cols.map((col, ci) => (
          <div key={ci} className="min-w-0">
            {col.map((i) => renderItem(i, true))}
          </div>
        ))}
      </div>
    );
  };

  const renderCouvertStrip = (block: Block) => (
    <section
      key={block.key}
      id={sectionId(block)}
      className={`scroll-mt-[136px] lg:scroll-mt-0 border-t ${T.rule} pt-5 mt-2`}
    >
      <h2 className={`font-menu font-black text-[22px] md:text-[26px] lg:text-[30px] tracking-[0.14em] uppercase leading-none mb-3 [text-wrap:balance] ${T.head}`}>
        {block.title}
      </h2>
      {block.note && <p className={`font-light italic text-[13px] -mt-1 mb-2 ${T.head}`}>{block.note}</p>}
      {/* Small screens: one item per row, price on the right */}
      <div className={`lg:hidden ${T.text}`}>
        {block.items.map((item) => {
          const [name, note, rest] = splitName(getName(item));
          const description = getDescription(item);
          return (
            <div key={item.id} className="flex items-baseline justify-between gap-3 py-[3px]">
              <span className="min-w-0">
                <span className="font-semibold text-[13px] tracking-[0.14em] uppercase">{name}</span>
                {note && <span className={`italic text-[12.5px] ml-1 ${noteClass(note)}`}>({note})</span>}
                {rest && <span className="font-light text-[13px] ml-1">{rest}</span>}
                {description && <span className="italic text-[12.5px] ml-1">({description})</span>}
              </span>
              {hasPrice(item) && <span className="font-light text-[14px] tabular-nums whitespace-nowrap">{formatPrice(item.price!)}</span>}
            </div>
          );
        })}
      </div>
      {/* Desktop: the printed one-line strip */}
      <p className={`hidden lg:block font-light text-[14px] lg:text-[15.5px] leading-[1.75] ${T.text}`}>
        {block.items.map((item, index) => {
          const [name, note, rest] = splitName(getName(item));
          const description = getDescription(item);
          const priceList = description.startsWith('|'); // ARAK: "11 | 30 | 50"
          return (
            <span key={item.id} className="inline">
              {index > 0 && <span className="opacity-60 mx-2">·</span>}
              <span className="font-semibold text-[13px] lg:text-[14.5px] tracking-[0.14em] uppercase">{name}</span>
              {note && <span className={`italic text-[13px] lg:text-[14.5px] ml-1 ${noteClass(note)}`}>({note})</span>}
              {rest && <span className="ml-1">{rest}</span>}
              {description && !priceList && <span className="italic text-[13px] lg:text-[14.5px] ml-1">({description})</span>}
              {hasPrice(item) && <span className="ml-1.5 tabular-nums">{formatPrice(item.price!)}</span>}
              {description && priceList && <span className="ml-1 tabular-nums">{description}</span>}
            </span>
          );
        })}
      </p>
    </section>
  );

  // Strip with a size legend (ARAK): title and legend on one line, items spread on the next.
  const renderTableStrip = (block: Block) => {
    const legend = (block.note || '').split('|').map((part) => part.trim()).filter(Boolean);
    return (
      <section
        key={block.key}
        id={sectionId(block)}
        className={`scroll-mt-[136px] lg:scroll-mt-0 border-t ${T.rule} pt-5 mt-2`}
      >
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className={`font-menu font-black text-[22px] md:text-[26px] lg:text-[30px] tracking-[0.14em] uppercase leading-none [text-wrap:balance] ${T.head}`}>
            {block.title}
          </h2>
          {legend.length > 0 && (
            <p className={`font-normal text-[12.5px] lg:text-[14px] tracking-[0.06em] ${T.text}`}>
              {legend.map((part, i) => {
                const [label, size] = splitName(part);
                return (
                  <span key={part} className="whitespace-nowrap">
                    {i > 0 && <span className="mx-2 opacity-70">|</span>}
                    <span className="uppercase">{label}</span>
                    {size && <span className="italic font-light ml-1">({size})</span>}
                  </span>
                );
              })}
            </p>
          )}
        </div>
        <div className={`mt-3 flex flex-wrap gap-x-14 gap-y-2 ${T.text}`}>
          {block.items.map((item) => {
            const [name] = splitName(getName(item));
            const description = getDescription(item);
            return (
              <span key={item.id} className="whitespace-nowrap">
                <span className="font-semibold text-[13px] lg:text-[14.5px] tracking-[0.14em] uppercase">{name}</span>
                <span className="font-light text-[14px] lg:text-[15.5px] tabular-nums ml-6">
                  {hasPrice(item) ? formatPrice(item.price!) : ''}
                  {description && <span className="ml-1">{description}</span>}
                </span>
              </span>
            );
          })}
        </div>
      </section>
    );
  };

  const renderBlock = (block: Block) => {
    if (block.isCouvertStrip) return renderCouvertStrip(block);
    if (block.isStrip && block.note) return renderTableStrip(block);
    if (block.isStrip) return renderCouvertStrip(block);
    const frame = block.boxed ? `border-[1.5px] ${T.box} px-5 pt-4 pb-2` : '';
    return (
      <section key={block.key} id={sectionId(block)} className={`scroll-mt-[136px] lg:scroll-mt-0 mb-8 ${frame}`}>
        {block.title && (
          <h2 className={`font-menu font-black text-[22px] md:text-[26px] lg:text-[30px] tracking-[0.14em] uppercase leading-none mb-2 [text-wrap:balance] ${T.head}`}>
            {block.title}
          </h2>
        )}
        {block.note && <p className={`font-light italic text-[13px] -mt-1 mb-2 ${T.head}`}>{block.note}</p>}
        {block.priceColumns && renderPriceHeader()}
        {block.items.length > 0 &&
          (block.priceColumns ? <div className={T.text}>{block.items.map(renderWineRow)}</div> : renderItems(block.items, block.columns))}
        {block.subSections.map((s, si) => (
          <div key={s.id} className={s.boxed ? `border-[1.5px] ${T.box} px-5 pt-3 pb-2 mt-6` : si === 0 && block.priceColumns ? 'mt-2' : 'mt-7'}>
            <h3
              className={`font-menu font-semibold uppercase mb-1 [text-wrap:balance] ${
                block.accentSubheadings
                  ? `text-[15px] lg:text-[16px] tracking-[0.16em] ${T.note}`
                  : `italic text-[16px] lg:text-[18px] tracking-[0.06em] ${T.head}`
              }`}
            >
              {(() => {
                const [t, n] = splitName(s.title);
                return (
                  <>
                    {t}
                    {n && <span className="not-italic font-light normal-case tracking-normal text-[12px] lg:text-[13px] ml-1.5">({n})</span>}
                  </>
                );
              })()}
            </h3>
            {block.priceColumns ? <div className={T.text}>{s.items.map(renderWineRow)}</div> : renderItems(s.items, s.columns)}
          </div>
        ))}
      </section>
    );
  };

  // Colours measured from the PDFs. Food: red headings/notes, dark-ink items.
  // Drinks: dark-ink headings, olive items, red notes. Boxes/rules follow the item colour.
  const T =
    tone === 'green'
      ? {
          ink: 'text-menu-ink', // page chrome (pills, jump bar, button)
          head: 'text-menu-ink',
          text: 'text-menu-olive',
          note: 'text-menu-red',
          box: 'border-menu-olive',
          rule: 'border-menu-olive/40',
          hover: 'hover:bg-menu-ink/10',
          border: 'border-menu-ink',
        }
      : {
          ink: 'text-menu-red',
          head: 'text-menu-red',
          text: 'text-menu-ink',
          note: 'text-menu-red',
          box: 'border-menu-ink',
          rule: 'border-menu-ink/30',
          hover: 'hover:bg-menu-red/10',
          border: 'border-menu-red',
        };

  return (
    <div className={`min-h-screen bg-menu-paper font-menu ${T.ink}`}>
      <div className="max-w-[1040px] mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-16" ref={topRef}>
        {/* Header: title and tagline, the same on every page */}
        <div className="flex flex-col items-center gap-3 md:gap-4">
          <h1 className="font-menu font-black text-menu-red text-[30px] md:text-[38px] lg:text-[42px] tracking-[0.14em] uppercase leading-none [text-wrap:balance]">
            {menu?.heroTitle || 'Our Menu'}
          </h1>
        </div>

        {/* Page switch: Food · SAJ Wraps · Alcoholic · Non-alcoholic · Wines */}
        <div className="mt-9 md:mt-12 flex justify-center">
          <div
            role="tablist"
            aria-label="Menu"
            className={`flex flex-wrap justify-center gap-2 md:gap-1 md:flex-nowrap md:border-[1.5px] ${T.border} md:rounded-full md:p-[3px]`}
          >
            {pages.map((p) => {
              const on = p.id === activePage;
              return (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => handlePage(p.id)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[12px] md:text-[13px] font-semibold tracking-[0.14em] uppercase whitespace-nowrap transition-colors border-[1.5px] md:border-0 ${
                    on ? `bg-current ${T.border}` : `${T.border} ${T.hover}`
                  }`}
                >
                  <span className={on ? 'text-menu-paper' : ''}>{pageName(p.id)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jump bar — small screens only (below lg the two-column page no longer fits) */}
        <div
          ref={jumpRef}
          className={`${readingOrder.length > 1 ? 'lg:hidden' : 'hidden'} sticky z-30 bg-menu-paper -mx-5 md:-mx-8 px-5 md:px-8 mt-5 border-b ${T.rule}`}
          style={{ top: NAVBAR_OFFSET }}
        >
          <nav aria-label="Sections" className="relative">
            <div
              className={`absolute inset-y-0 right-0 z-10 w-20 flex items-center justify-end bg-gradient-to-l from-menu-paper via-menu-paper/90 to-transparent transition-opacity ${
                jumpMore ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <button
                type="button"
                aria-label={locale === 'pt' ? 'Mais secções' : 'More sections'}
                onClick={() => jumpRef.current?.querySelector('ul')?.scrollBy({ left: 180, behavior: 'smooth' })}
                className={`h-full pl-6 pr-1 flex items-center ${T.ink}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <ul
              className="flex gap-6 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {readingOrder.map((b) => {
                const id = sectionId(b);
                const on = activeSection === id || (!activeSection && readingOrder[0] === b);
                return (
                  <li key={b.key} className="flex-shrink-0">
                    <a
                      href={`#${id}`}
                      data-target={id}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setActiveSection(id);
                      }}
                      className={`block py-3 text-[12.5px] font-semibold tracking-[0.16em] uppercase whitespace-nowrap border-b-2 transition-opacity ${
                        on ? 'opacity-100 border-current' : 'opacity-55 border-transparent'
                      }`}
                    >
                      {b.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* The page: two columns on lg+, one column below */}
        <div className="mt-8 lg:mt-16">
          {readingOrder.length === 0 && (
            <p className="text-center py-12 font-light">{menu?.emptyCategory || 'No items in this category yet.'}</p>
          )}
          {current.right.length === 0 && current.bottom.length === 0 ? (
            <div className="max-w-[680px] mx-auto">{current.left.map(renderBlock)}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 xl:gap-x-12">
                <div className="min-w-0">{current.left.map(renderBlock)}</div>
                <div className="min-w-0">{current.right.map(renderBlock)}</div>
              </div>
              {current.bottom.map(renderBlock)}
            </>
          )}

        </div>

        {/* Allergen / VAT line, as on the printed menu */}
        <p className={`mt-10 text-center font-light text-[10.5px] md:text-[11px] lg:text-[12px] leading-[1.45] max-w-[80ch] mx-auto ${T.text}`}>
          {menu?.allergenNote || 'Please ask our team about allergens and dietary requirements. Prices in € including VAT.'}
        </p>

        <div className="text-center mt-10">
          <button
            onClick={() => openWidget('button', 'menu_page')}
            disabled={isOpening}
            className={`rounded-full border-[1.5px] border-current px-7 py-2.5 text-[13px] font-semibold tracking-[0.14em] uppercase ${T.hover} transition-colors disabled:opacity-60`}
          >
            {isOpening
              ? locale === 'pt' ? 'A abrir…' : 'Opening…'
              : locale === 'pt' ? 'Reservar mesa' : 'Book a table'}
          </button>
        </div>
      </div>

      {/* Back to top — small screens only */}
      <button
        onClick={scrollToTop}
        aria-label={menu?.backToTop || 'Back to top'}
        className={`lg:hidden fixed right-4 bottom-5 z-30 w-11 h-11 rounded-full border-[1.5px] border-current bg-menu-paper grid place-items-center shadow-md transition-all duration-300 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
}
