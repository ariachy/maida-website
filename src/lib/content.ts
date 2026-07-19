import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';

/**
 * SERVER-ONLY content loader.
 *
 * Why this exists:
 *   The content pages used to `import menuData from '@/data/menu.json'` (and the
 *   same for blog.json). A static import is inlined into the build output, so the
 *   only way to reflect an edited JSON file was a full `next build` — which this
 *   shared host cannot run.
 *
 *   Reading the files with `fs.readFile` at render time means the page reflects
 *   whatever is currently on disk. The admin already writes these JSON files when
 *   it "publishes", so a publish + on-demand revalidation (see src/lib/revalidate.ts)
 *   updates the live site with no build step.
 *
 * Why it is separate from i18n.ts `loadTranslations()`:
 *   i18n.ts is imported by client components, so it must NOT touch `fs`. This file
 *   is marked `server-only`, so importing it from a client component is a hard
 *   build error rather than a silent runtime failure.
 *
 * Path note:
 *   `process.cwd()` is the project root on the server (e.g. /home/thehlxvx/maida.pt).
 *   The full project — including src/data/*.json — is uploaded to the host, so the
 *   files are always present at this path. (They have to be: the admin writes to
 *   them.) This is NOT a traced standalone bundle, so file tracing is not a concern.
 */

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

// ----- Types (kept permissive to match the existing loose handling) -----

export interface MenuCategory {
  id: string;
  slug: string;
  image: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  sortOrder: number;
}

export interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface BlogContentBlock {
  type: string;
  text?: string;
  items?: string[];
}

export interface BlogRelatedPost {
  title: string;
  subtitle: string;
  slug: string | null;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  tags: string[];
  content: BlogContentBlock[];
  relatedPosts?: BlogRelatedPost[];
}

export interface BlogData {
  posts: BlogPost[];
  tags?: string[];
}

// ----- Raw reader -----

async function readJson<T>(file: string): Promise<T> {
  const full = path.join(DATA_DIR, file);
  const raw = await fs.readFile(full, 'utf-8');
  return JSON.parse(raw) as T;
}

// ----- Public loaders -----
// `cache()` dedupes reads within a single request/render so that, e.g., a page
// and its generateMetadata don't read the same file twice. It does NOT cache
// across requests — that is the Full Route Cache's job, busted by revalidatePath.

export const getMenuData = cache(async (): Promise<MenuData> => {
  return readJson<MenuData>('menu.json');
});

export const getBlogData = cache(async (): Promise<BlogData> => {
  return readJson<BlogData>('blog.json');
});

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const data = await getBlogData();
  return data.posts ?? [];
});

export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPost | null> => {
    const posts = await getBlogPosts();
    return posts.find((p) => p.slug === slug) ?? null;
  }
);

export const getLatestBlogPost = cache(async (): Promise<BlogPost | null> => {
  const posts = await getBlogPosts();
  if (posts.length === 0) return null;
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
});

/** mtime of a content file, used for dynamic sitemap lastModified. */
export async function getContentMtime(file: string): Promise<Date> {
  try {
    const stat = await fs.stat(path.join(DATA_DIR, file));
    return stat.mtime;
  } catch {
    return new Date();
  }
}
