import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale } from '@/lib/i18n';
import { getServerTranslations } from '@/lib/translations';
import { generatePageMetadata } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import BlogPostClient from '@/components/blog/BlogPostClient';
import { getBlogPosts, getBlogPostBySlug } from '@/lib/content';

// See menu/page.tsx for caching rationale. revalidateContent('blog') busts the
// whole /[lang]/blog/[slug] segment so edited or newly published posts go live
// without a build.
export const revalidate = 3600;

// Types kept local to match BlogPostClient's expected shape.
type ContentBlockType = 'paragraph' | 'heading' | 'list' | 'callout' | 'highlight' | 'cta';

interface ContentBlock {
  type: ContentBlockType;
  text?: string;
  items?: string[];
}

interface RelatedPost {
  title: string;
  subtitle: string;
  slug: string | null;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  tags: string[];
  content: ContentBlock[];
  relatedPosts?: RelatedPost[];
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  const locale = params.lang;
  const post = await getBlogPostBySlug(params.slug);

  if (!post || !isValidLocale(locale)) {
    return {
      title: 'Post Not Found | Maída',
    };
  }

  return generatePageMetadata({
    title: `${post.title} | Maída`,
    description: post.excerpt,
    path: `/blog/${params.slug}`,
    locale,
    image: post.image,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const locale = params.lang;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const [post, translations] = await Promise.all([
    getBlogPostBySlug(params.slug),
    getServerTranslations(locale),
  ]);

  if (!post) {
    notFound();
  }

  // Cast the post to the strict client type.
  const typedPost: BlogPost = {
    ...post,
    content: post.content.map((block) => ({
      ...block,
      type: block.type as ContentBlockType,
    })),
    relatedPosts: post.relatedPosts as RelatedPost[] | undefined,
  };

  const breadcrumbs = [
    { name: 'Maída', url: `https://maida.pt/${locale}` },
    { name: locale === 'pt' ? 'Descobrir' : 'Discover', url: `https://maida.pt/${locale}/blog` },
    { name: post.title, url: `https://maida.pt/${locale}/blog/${post.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <BlogPostClient translations={translations} locale={locale} post={typedPost} />
    </>
  );
}
