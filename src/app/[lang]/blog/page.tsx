import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import BlogClient from '@/components/blog/BlogClient';
import blogData from '@/data/blog.json';

export async function generateMetadata({ params }: { params: { lang: string } }) {
  return {
    title: 'Blog | Stories from Maída',
    description: 'The traditions, flavors, music, and moments behind everything we do at Maída. Discover the stories of Lebanese cuisine and Mediterranean culture.',
  };
}

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
