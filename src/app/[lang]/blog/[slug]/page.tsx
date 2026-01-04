import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import BlogPostClient from '@/components/blog/BlogPostClient';
import blogData from '@/data/blog.json';

// Define types to match BlogPostClient
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
  return blogData.posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { lang: string; slug: string } }) {
  const post = blogData.posts.find((p) => p.slug === params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | Maída',
    };
  }
  
  return {
    title: `${post.title} | Maída Blog`,
    description: post.excerpt,
  };
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
  
  const post = blogData.posts.find((p) => p.slug === params.slug);
  
  if (!post) {
    notFound();
  }
  
  const translations = await loadTranslations(locale);
  
  // Cast the post to the correct type
  const typedPost: BlogPost = {
    ...post,
    content: post.content.map((block) => ({
      ...block,
      type: block.type as ContentBlockType,
    })),
    relatedPosts: post.relatedPosts as RelatedPost[] | undefined,
  };
  
  return <BlogPostClient translations={translations} locale={locale} post={typedPost} />;
}
