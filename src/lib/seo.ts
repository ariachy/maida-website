import { Metadata } from 'next';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';

const baseUrl = 'https://maida.pt';

/**
 * BCP-47 language tag for hreflang / html lang.
 *
 * Bare 'pt' is ambiguous — it lets Google serve these pages to Brazilian searchers,
 * where the vocabulary is wrong (sumo vs suco, pequeno-almoço vs café da manhã, and so
 * on). The site is European Portuguese, so it must say so. 'en' stays bare: the content
 * is en-GB but there is no en-US variant to disambiguate from.
 *
 * Keep this in sync with `htmlLang()` in src/app/(site)/[lang]/layout.tsx — the two must
 * agree, or the <html lang> and the hreflang will contradict each other.
 */
export const bcp47 = (locale: string): string => (locale === 'pt' ? 'pt-PT' : 'en');

/**
 * next.config.js sets `trailingSlash: true`, so the canonical form of every route ends
 * in a slash. Emitting the unslashed form here made every canonical and hreflang point
 * at a URL that 308-redirects — wasted crawl budget, and a canonical that does not match
 * the URL it is served on.
 */
const url = (locale: string, cleanPath: string) => `${baseUrl}/${locale}${cleanPath}/`;

/**
 * Generate hreflang alternates for any page.
 *
 * The language map is built from `locales` in i18n.ts — the single source of truth for
 * which languages are live. To launch de/es/it later, add them to the `locales` array in
 * i18n.ts and the sitemap + every page's hreflang update automatically. If a locale ever
 * needs a region tag (de-DE, es-ES…), add it to bcp47() above.
 *
 * @param path - The page path without locale (e.g. '/menu', or '' for the homepage)
 * @param locale - Current locale
 */
export function generateAlternates(path: string, locale: string) {
  const pagePath = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = pagePath === '/' ? '' : pagePath.replace(/\/$/, '');

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[bcp47(l)] = url(l, cleanPath);
  }
  // x-default points at the default locale.
  languages['x-default'] = url(defaultLocale, cleanPath);

  return {
    canonical: url(locale, cleanPath),
    languages,
  };
}

/**
 * Generate full metadata for a page with proper SEO.
 *
 * NOTE: the `alternates` returned here REPLACE (not merge with) any alternates set by a
 * parent layout — Next.js metadata resolution is shallow per top-level field. So this
 * function is the authority on canonical + hreflang for every page that calls it
 * (menu, search, reserve, …). That is why the pt-PT fix has to live here and not only in
 * the layout.
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
      alternateLocale: locale === 'pt' ? ['en_GB'] : ['pt_PT'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
