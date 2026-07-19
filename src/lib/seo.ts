import { Metadata } from 'next';
import { locales, defaultLocale } from '@/lib/i18n';

const baseUrl = 'https://maida.pt';

/**
 * Generate hreflang alternates for any page.
 *
 * The language map is now built from `locales` in i18n.ts — the single source of
 * truth for which languages are live. To launch de/es/it later, add them to the
 * `locales` array in i18n.ts and the sitemap + every page's hreflang update
 * automatically. No edits needed here.
 *
 * @param path - The page path without locale (e.g., '/menu', or '' for homepage)
 * @param locale - Current locale
 */
export function generateAlternates(path: string, locale: string) {
  const pagePath = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = pagePath === '/' ? '' : pagePath;

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${baseUrl}/${l}${cleanPath}`;
  }
  // x-default points at the default locale.
  languages['x-default'] = `${baseUrl}/${defaultLocale}${cleanPath}`;

  return {
    canonical: `${baseUrl}/${locale}${cleanPath}`,
    languages,
  };
}

/**
 * Generate full metadata for a page with proper SEO.
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
