import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';
import { getBlogPosts, getContentMtime } from '@/lib/content';

const baseUrl = 'https://maida.pt';

// Re-derive the sitemap at most hourly, plus immediately when content publishes
// (revalidateContent() calls revalidatePath('/sitemap.xml')).
export const revalidate = 3600;

/**
 * Static (non-content-driven) pages.
 *
 * ⚠️ VERIFY against the actual folders in src/app/[lang]/ before deploying.
 * These were already in the live sitemap, so they are assumed valid:
 */
const staticPages = [
  '', // Homepage
  '/menu',
  '/story',
  '/contact',
  '/maida-live',
  '/maida-saj',
  '/coffee-tea',
  '/blog',
  // '/reserve',  // strongly implied by the ReserveAction → uncomment once the route is confirmed
  // '/review',   // confirm a /review route exists (review_url in settings is an external g.page link)
  // '/privacy',  // confirm a privacy page route exists
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Content mtimes drive lastModified instead of a frozen hardcoded date.
  const [menuMtime, blogMtime, posts] = await Promise.all([
    getContentMtime('menu.json'),
    getContentMtime('blog.json'),
    getBlogPosts(),
  ]);

  // Reasonable lastModified for each static page.
  const lastModifiedFor = (page: string): Date => {
    if (page === '/menu') return menuMtime;
    if (page === '/blog' || page === '') {
      // Homepage surfaces the latest post, so it tracks blog changes too.
      return new Date(Math.max(blogMtime.getTime(), menuMtime.getTime()));
    }
    // Pages with no JSON content source: fall back to the newest content edit.
    return new Date(Math.max(blogMtime.getTime(), menuMtime.getTime()));
  };

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: lastModifiedFor(page),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : page === '/menu' ? 0.9 : 0.7,
      });
    }
  }

  // Individual blog posts, per locale, dated by the post itself.
  for (const post of posts) {
    const postDate = new Date(post.date);
    const lastModified = isNaN(postDate.getTime()) ? blogMtime : postDate;
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
