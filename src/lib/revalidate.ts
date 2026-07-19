import 'server-only';
import { revalidatePath } from 'next/cache';
import { locales } from '@/lib/i18n';

/**
 * Maps a content type to every route that depends on it and revalidates them.
 *
 * - 'translations' | 'all': locale JSON drives navbar, footer, hero, homepage,
 *   story, contact, maida-live, menu, blog — i.e. every page under the [lang]
 *   layout. So we revalidate the WHOLE locale layout in one call, which busts
 *   the layout and all nested routes for all locales.
 * - 'menu' / 'blog': only the routes that read those specific JSON files.
 *
 * Call directly from a save handler after writing the file (preferred), or over
 * HTTP via /api/revalidate or the repurposed /api/admin/rebuild.
 *
 * Because the locale set comes from i18n.ts, enabling de/es/it later needs no
 * change here.
 */
export function revalidateContent(
  type: 'menu' | 'blog' | 'translations' | 'all'
): string[] {
  // Broadest case: anything that can touch shared/translated text re-renders
  // every page under the locale layout.
  if (type === 'translations' || type === 'all') {
    revalidatePath('/[lang]', 'layout');
    revalidatePath('/sitemap.xml');
    return ['/[lang] (layout — all locales + every nested route)', '/sitemap.xml'];
  }

  const paths: string[] = [];
  const add = (p: string) => {
    if (!paths.includes(p)) paths.push(p);
  };

  if (type === 'menu') {
    for (const l of locales) add(`/${l}/menu`);
  }

  if (type === 'blog') {
    for (const l of locales) {
      add(`/${l}/blog`);
      add(`/${l}`); // homepage surfaces the latest post
    }
    revalidatePath('/[lang]/blog/[slug]', 'page');
    revalidatePath('/[lang]', 'page');
  }

  paths.forEach((p) => revalidatePath(p));
  revalidatePath('/sitemap.xml');

  return paths;
}
