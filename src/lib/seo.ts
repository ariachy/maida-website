import { Metadata } from 'next';

const baseUrl = 'https://maida.pt';

/**
 * Generate hreflang alternates for any page
 * @param path - The page path without locale (e.g., '/menu', '/contact', or '' for homepage)
 * @param locale - Current locale
 */
export function generateAlternates(path: string, locale: string) {
  const pagePath = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = pagePath === '/' ? '' : pagePath;
  
  return {
    canonical: `${baseUrl}/${locale}${cleanPath}`,
    languages: {
      'en': `${baseUrl}/en${cleanPath}`,
      'pt': `${baseUrl}/pt${cleanPath}`,
      'x-default': `${baseUrl}/en${cleanPath}`,
    },
  };
}

/**
 * Generate full metadata for a page with proper SEO
 * @param options - Metadata options
 */
export function generatePageMetadata({
  title,
  description,
  path,
  locale,
  image,
}: {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string;
}): Metadata {
  const alternates = generateAlternates(path, locale);
  const ogImage = image || '/images/og-image.jpg';
  
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      images: [{ url: ogImage }],
      locale: locale === 'pt' ? 'pt_PT' : 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
