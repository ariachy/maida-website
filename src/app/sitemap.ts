import { MetadataRoute } from 'next';

const locales = ['en', 'pt', 'de', 'it', 'es'];
const baseUrl = 'https://maida.pt';

// All pages in the site
const pages = [
  '', // Homepage
  '/menu',
  '/story',
  '/contact',
  '/maida-live',
  '/maida-saj',
  '/coffee-tea',
  '/blog',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Generate entries for each page in each locale
  for (const page of pages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : page === '/menu' ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${page}`])
          ),
        },
      });
    }
  }

  return entries;
}
