import { locales } from '@/lib/i18n';

/**
 * ⚠️ VERIFY BEFORE DEPLOY — opening hours.
 * The footer settings (api/meetmeatmaida defaults) say the kitchen opens 12:00,
 * while this structured data said 17:00. They cannot both be right. The hours
 * below are kept at the previous structured-data values (17:00 open) but the
 * OPEN TIME MUST BE CONFIRMED against the real schedule, and then made to match
 * the footer string. Tuesday is intentionally omitted = closed.
 *
 * The previous version listed Friday and Saturday TWICE (once closing 23:00 in
 * the Wed–Mon block, once closing 01:00) — a direct contradiction. That is fixed
 * here: standard days and the late-close days are now mutually exclusive.
 */
const OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Wednesday', 'Thursday', 'Sunday', 'Monday'],
    opens: '17:00',
    closes: '23:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Friday', 'Saturday'],
    opens: '17:00',
    closes: '01:00',
  },
  // Tuesday absent = closed.
];

/**
 * ⚠️ MANUAL FIELD — aggregate rating.
 * There is no rating data in the JSON content model, so this cannot be sourced
 * "dynamically" — it has to be maintained by hand here. Google requires that an
 * aggregateRating reflect real, visible reviews; a self-asserted rating with no
 * on-page reviews can trigger a structured-data manual action. Keep these in
 * sync with the real Google rating, or delete the `aggregateRating` block.
 */
const AGGREGATE_RATING = {
  '@type': 'AggregateRating',
  ratingValue: '4.8',
  reviewCount: '115',
  bestRating: '5',
  worstRating: '1',
};

// Restaurant structured data for Google
export function RestaurantJsonLd() {
  const restaurantData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': 'https://maida.pt/#restaurant',
    name: 'Maída',
    alternateName: 'Maída Lisboa',
    description:
      'Mediterranean restaurant with Lebanese soul. A gathering place for shared plates, natural wines, and evenings that linger in Cais do Sodré, Lisbon.',
    url: 'https://maida.pt',
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

    hasMenu: {
      '@type': 'Menu',
      url: 'https://maida.pt/en/menu',
      hasMenuSection: [
        {
          '@type': 'MenuSection',
          name: 'Mezze',
          description: 'Traditional Lebanese small plates for sharing',
        },
        {
          '@type': 'MenuSection',
          name: 'SAJ',
          description: 'Lebanese flatbread baked on a traditional dome',
        },
        {
          '@type': 'MenuSection',
          name: 'Mains',
          description: 'Mediterranean grilled dishes and specialties',
        },
      ],
    },

    aggregateRating: AGGREGATE_RATING,

    image: [
      'https://maida.pt/images/og-image.jpg',
      'https://maida.pt/images/hero/hero-1.jpg',
    ],

    sameAs: [
      'https://www.instagram.com/maida.lisbon',
      'https://www.facebook.com/maida.lisbon',
    ],

    acceptsReservations: 'True',
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://maida.pt/en/reserve',
        inLanguage: 'en',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Reservation',
        name: 'Table reservation',
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

// Organization structured data
export function OrganizationJsonLd() {
  const orgData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://maida.pt/#organization',
    name: 'Maída',
    url: 'https://maida.pt',
    logo: 'https://maida.pt/images/brand/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+351966604674',
      contactType: 'reservations',
      availableLanguage: ['English', 'Portuguese', 'German', 'Italian', 'Spanish'],
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
 * Render this on content pages (menu, blog, blog/[slug], search, story, …).
 * `items` is an ordered trail, e.g.
 *   [{ name: 'Home', url: 'https://maida.pt/en' },
 *    { name: 'Blog', url: 'https://maida.pt/en/blog' }]
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

// Website structured data — now advertises a sitewide SearchAction so the site
// is eligible for the Google sitelinks searchbox. The target must resolve to a
// working results page: /[lang]/search?q=... (provided in src/app/[lang]/search).
export function WebsiteJsonLd() {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://maida.pt/#website',
    url: 'https://maida.pt',
    name: 'Maída',
    alternateName: ['Maída Lisbon', 'Maída Lisboa', 'Maida'],
    description: 'Mediterranean restaurant with Lebanese soul in Lisbon',
    publisher: {
      '@id': 'https://maida.pt/#organization',
    },
    // Driven by the live locale set (i18n.ts), so it stays in sync as languages launch.
    inLanguage: [...locales],
    potentialAction: {
      '@type': 'SearchAction',
      // trailingSlash:true → the path segment keeps its trailing slash before "?".
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://maida.pt/en/search/?q={search_term_string}',
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
