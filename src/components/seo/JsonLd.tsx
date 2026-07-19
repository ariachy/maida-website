import { locales, type Locale } from '@/lib/i18n';
import { bcp47 } from '@/lib/seo';
import type { MenuData } from '@/lib/content';

/**
 * CANONICAL OPENING HOURS — single source of truth for structured data.
 *
 * Confirmed with the restaurant 2026-07-17:
 *   Tuesday                closed (absent from this list = closed)
 *   Wed, Thu, Sun, Mon     18:00 – 23:30   (kitchen closes 23:00)
 *   Fri, Sat               18:00 – 02:00   (kitchen closes 23:30)
 *
 * Fri/Sat: 02:00 is the SCHEDULED close. The room sometimes empties earlier and they
 * shut early — that is expected, and is not a reason to publish 01:00 here. Structured
 * data describes the schedule, not the outcome; publishing 01:00 would drop Maída out
 * of "open now" results for the 01:00–02:00 window on its two busiest nights. The
 * user-facing copy hedges ("till late (02:00)" / "até tarde (02:00)"); this field
 * cannot, so it states the plan.
 *
 * If these change, they change HERE and in the locale dictionaries (contact.hours.*,
 * footer.hoursValue, homeVisit.hours.*, visit.hours.value, reserve.hoursTime/
 * hoursWeekend). Nothing else hardcodes hours.
 */
const OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Wednesday', 'Thursday', 'Sunday', 'Monday'],
    opens: '18:00',
    closes: '23:30',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Friday', 'Saturday'],
    opens: '18:00',
    closes: '02:00',
  },
  // Tuesday absent = closed.
];

/**
 * REMOVED: aggregateRating.
 * It was hardcoded (4.8 / 115) with no rating data in the content model and no reviews
 * rendered anywhere on the page. Self-asserted review markup with no on-page,
 * user-generated reviews is a structured-data manual action risk. Do not re-add unless
 * real reviews are displayed on the page they mark up.
 */

const BASE = 'https://maida.pt';

// trailingSlash: true in next.config.js — keep generated URLs consistent with the real
// routes so schema targets resolve without a redirect hop.
const url = (locale: Locale, path = '') => `${BASE}/${locale}${path}/`;

// bcp47() is imported from lib/seo — the same helper that drives <html lang> and
// hreflang, so schema can never disagree with the page it describes.

interface LocaleProps {
  locale: Locale;
}

// Restaurant structured data for Google
export function RestaurantJsonLd({ locale }: LocaleProps) {
  const restaurantData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${BASE}/#restaurant`,
    name: 'Maída',
    alternateName: 'Maída Lisboa',
    description:
      'Mediterranean restaurant with Lebanese soul. A gathering place for shared plates, natural wines, and evenings that linger in Cais do Sodré, Lisbon.',
    url: BASE,
    telephone: '+351966604674',
    email: 'info@maida.pt',

    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua da Boavista 66',
      addressLocality: 'Lisboa',
      addressRegion: 'Lisboa',
      postalCode: '1200-068',
      addressCountry: 'PT',
    },

    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.7069,
      longitude: -9.1427,
    },

    openingHoursSpecification: OPENING_HOURS,

    servesCuisine: ['Mediterranean', 'Lebanese', 'Middle Eastern'],
    priceRange: '€€',

    // Points at the menu in the page's own language. The full Menu graph with every
    // MenuItem is emitted by <MenuJsonLd /> on the menu route itself; this is the same
    // node by @id, so the two merge rather than compete.
    hasMenu: {
      '@id': `${BASE}/#menu-${locale}`,
      '@type': 'Menu',
      url: url(locale, '/menu'),
      inLanguage: bcp47(locale),
    },

    image: [`${BASE}/images/og-image.jpg`, `${BASE}/images/hero/hero-1.jpg`],

    sameAs: [
      'https://www.instagram.com/maida.lisbon',
      'https://www.facebook.com/maida.lisbon',
    ],

    acceptsReservations: 'True',
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        // /[lang]/reserve exists and renders ReserveClient — verified, not a 404.
        urlTemplate: url(locale, '/reserve'),
        inLanguage: bcp47(locale),
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Reservation',
        name: locale === 'pt' ? 'Reserva de mesa' : 'Table reservation',
      },
    },

    paymentAccepted: 'Cash, Credit Card, Debit Card',
    currenciesAccepted: 'EUR',

    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Outdoor Seating', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'WiFi', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Wheelchair Accessible', value: true },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantData) }}
    />
  );
}

/**
 * Full Menu -> MenuSection -> MenuItem graph, generated from menu.json + the locale
 * dictionary at render time. Render on the menu route only.
 *
 *  - `offers` is intentionally ABSENT. There is no price data anywhere in the content
 *    model (menu.json items carry id/categoryId/sortOrder/subCategory/active only).
 *    Inventing prices for schema is worse than omitting them. If prices are ever added
 *    to menu.json, add: offers: { '@type': 'Offer', price, priceCurrency: 'EUR' }.
 *  - `suitableForDiet` is intentionally ABSENT pending the dietary-tag pass. The tag
 *    vocabulary exists (menu.tags) but no item is tagged yet.
 *  - Field resolution mirrors MenuClient exactly: item[locale] -> dictionary -> item.en.
 *  - Only active === true items are emitted, matching what the page renders.
 */
export function MenuJsonLd({
  menuData,
  translations,
  locale,
}: {
  menuData: MenuData;
  translations: any;
  locale: Locale;
}) {
  const menu = translations?.menu ?? {};

  const resolve = (item: any, field: 'name' | 'description'): string | undefined =>
    item?.[locale]?.[field] || menu?.items?.[item.id]?.[field] || item?.en?.[field];

  const isLive = (item: any) => item.active === true;

  const toMenuItem = (item: any) => {
    const name = resolve(item, 'name') || item.id.replace(/-/g, ' ');
    const description = resolve(item, 'description');
    return {
      '@type': 'MenuItem',
      name,
      ...(description ? { description } : {}),
    };
  };

  const sections = [...menuData.categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => {
      const inCategory = (menuData.items as any[])
        .filter((i) => i.categoryId === category.id && isLive(i))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      if (inCategory.length === 0) return null;

      // Sub-category order comes from the subCategories records, same as the page.
      const subIds = ((menuData as any).subCategories ?? [])
        .filter((s: any) => s.categoryId === category.id)
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((s: any) => s.id);

      const ungrouped = inCategory.filter((i) => !i.subCategory);

      const subSections = subIds
        .map((subId: string) => {
          const subItems = inCategory.filter((i) => i.subCategory === subId);
          if (subItems.length === 0) return null;
          return {
            '@type': 'MenuSection',
            name: menu?.subCategories?.[subId] || subId.replace(/-/g, ' '),
            hasMenuItem: subItems.map(toMenuItem),
          };
        })
        .filter(Boolean);

      return {
        '@type': 'MenuSection',
        name: menu?.categories?.[category.id]?.name || category.id,
        ...(menu?.categories?.[category.id]?.description
          ? { description: menu.categories[category.id].description }
          : {}),
        ...(ungrouped.length ? { hasMenuItem: ungrouped.map(toMenuItem) } : {}),
        ...(subSections.length ? { hasMenuSection: subSections } : {}),
      };
    })
    .filter(Boolean);

  const menuLd = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${BASE}/#menu-${locale}`,
    name: locale === 'pt' ? 'Menu Maída' : 'Maída Menu',
    url: url(locale, '/menu'),
    inLanguage: bcp47(locale),
    isPartOf: { '@id': `${BASE}/#restaurant` },
    hasMenuSection: sections,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(menuLd) }}
    />
  );
}

// Organization structured data
export function OrganizationJsonLd() {
  const orgData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE}/#organization`,
    name: 'Maída',
    url: BASE,
    logo: `${BASE}/images/brand/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+351966604674',
      contactType: 'reservations',
      // Only en/pt are generated today (see i18n.ts `locales`). de/it/es were listed
      // here but those routes 404 and carry no menu translations.
      availableLanguage: ['English', 'Portuguese'],
    },
    sameAs: [
      'https://www.instagram.com/maida.lisbon',
      'https://www.facebook.com/maida.lisbon',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData) }}
    />
  );
}

/**
 * Breadcrumb structured data.
 * Render on content pages (menu, blog, blog/[slug], search, story, …).
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  );
}

/**
 * Website structured data.
 *
 * SearchAction KEPT — /[lang]/search exists (src/app/[lang]/search/page.tsx), takes ?q=,
 * renders results server-side from blog.json, and works without JS. The target is now
 * locale-aware rather than always /en/.
 * trailingSlash:true → the path segment keeps its slash before "?".
 */
export function WebsiteJsonLd({ locale }: LocaleProps) {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    url: BASE,
    name: 'Maída',
    alternateName: ['Maída Lisbon', 'Maída Lisboa', 'Maida'],
    description: 'Mediterranean restaurant with Lebanese soul in Lisbon',
    publisher: {
      '@id': `${BASE}/#organization`,
    },
    // Driven by the live locale set (i18n.ts), so it stays in sync as languages launch.
    inLanguage: locales.map(bcp47),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url(locale, '/search')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  );
}
