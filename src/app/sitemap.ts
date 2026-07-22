import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';
import { getBlogPosts, getContentMtime } from '@/lib/content';

const baseUrl = 'https://maida.pt';

// Re-derive the sitemap at most hourly, plus immediately when content publishes
// (revalidateContent() calls revalidatePath('/sitemap.xml')).
export const revalidate = 3600;

/**
 * Static (non-content-driven) pages. All routes verified live in the build route table.
 * trailingSlash:true in next.config.js — every URL ends in '/' to match canonicals and
 * avoid a 308 redirect hop. /search is intentionally excluded (internal results).
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
  '/faq',
  '/reserve',
  '/join-us',
  '/privacy',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Content mtimes drive lastModified instead of a frozen hardcoded date.
  const [menuMtime, blogMtime, posts] = await Promise.all([
    getContentMtime('menu.json'),
    getContentMtime('blog.json'),
    getBlogPosts(),
  ]);

  const lastModifiedFor = (page: string): Date => {
    if (page === '/menu') return menuMtime;
    if (page === '/blog' || page === '') {
      return new Date(Math.max(blogMtime.getTime(), menuMtime.getTime()));
    }
    return new Date(Math.max(blogMtime.getTime(), menuMtime.getTime()));
  };

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page}/`,
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
        url: `${baseUrl}/${locale}/blog/${post.slug}/`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}