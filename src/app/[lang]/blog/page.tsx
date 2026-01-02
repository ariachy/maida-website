import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import BlogClient from '@/components/blog/BlogClient';
import blogData from '@/data/blog.json';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maída - Mediterranean Flavours, Lebanese Soul | Discover',
  description: 'Stories from our kitchen, our roots, and the table. Traditions, flavours, and moments.',
};

export default async function BlogPage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;
  
  if (!isValidLocale(locale)) {
    notFound();
  }
  
  const translations = await loadTranslations(locale);
  
  return <BlogClient translations={translations} locale={locale} posts={blogData.posts} />;
}


