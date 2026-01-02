import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import BlogPostClient from '@/components/blog/BlogPostClient';
import blogData from '@/data/blog.json';

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
  
  return <BlogPostClient translations={translations} locale={locale} post={post} />;
}
