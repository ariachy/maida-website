'use client';

import Script from 'next/script';

// Restaurant structured data for Google
export function RestaurantJsonLd() {
  const restaurantData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': 'https://maida.pt/#restaurant',
    name: 'Maída',
    alternateName: 'Maída Lisboa',
    description: 'Mediterranean restaurant with Lebanese soul. A gathering place for shared plates, natural wines, and evenings that linger in Cais do Sodré, Lisbon.',
    url: 'https://maida.pt',
    telephone: '+351961111383',
    email: 'hello@maida.pt',
    
    // Address
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua da Boavista 66',
      addressLocality: 'Lisboa',
      addressRegion: 'Lisboa',
      postalCode: '1200-068',
      addressCountry: 'PT',
    },
    
    // Geo coordinates (Cais do Sodré area)
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.7069,
      longitude: -9.1427,
    },
    
    // Opening Hours
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Wednesday', 'Thursday', 'Sunday'],
        opens: '12:30',
        closes: '23:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Friday', 'Saturday'],
        opens: '12:30',
        closes: '02:00',
      },
    ],
    
    // Cuisine & Category
    servesCuisine: ['Mediterranean', 'Lebanese', 'Middle Eastern'],
    priceRange: '€€',
    
    // Menu
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
    
    // Ratings
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '115',
      bestRating: '5',
      worstRating: '1',
    },
    
    // Images
    image: [
      'https://maida.pt/images/og-image.jpg',
      'https://maida.pt/images/hero/hero-1.jpg',
    ],
    
    // Social & Contact
    sameAs: [
      'https://www.instagram.com/maida.lisbon',
      'https://www.facebook.com/maida.lisbon',
    ],
    
    // Reservations
    acceptsReservations: 'True',
    
    // Payment
    paymentAccepted: 'Cash, Credit Card, Debit Card',
    currenciesAccepted: 'EUR',
    
    // Amenities
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Outdoor Seating', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'WiFi', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Wheelchair Accessible', value: true },
    ],
  };

  return (
    <Script
      id="restaurant-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantData) }}
      strategy="afterInteractive"
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
      telephone: '+351961111383',
      contactType: 'reservations',
      availableLanguage: ['English', 'Portuguese', 'German', 'Italian', 'Spanish'],
    },
    sameAs: [
      'https://www.instagram.com/maida.lisbon',
      'https://www.facebook.com/maida.lisbon',
    ],
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData) }}
      strategy="afterInteractive"
    />
  );
}

// Breadcrumb structured data (for pages)
export function BreadcrumbJsonLd({ 
  items 
}: { 
  items: { name: string; url: string }[] 
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
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      strategy="afterInteractive"
    />
  );
}

// Website search structured data
export function WebsiteJsonLd() {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://maida.pt/#website',
    url: 'https://maida.pt',
    name: 'Maída',
    description: 'Mediterranean restaurant with Lebanese soul in Lisbon',
    publisher: {
      '@id': 'https://maida.pt/#organization',
    },
    inLanguage: ['en', 'pt', 'de', 'it', 'es'],
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      strategy="afterInteractive"
    />
  );
}
