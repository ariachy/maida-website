import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import BlogClient from '@/components/blog/BlogClient';
import blogData from '@/data/blog.json';

export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string } 
}): Promise<Metadata> {
  const locale = params.lang;
  
  if (!isValidLocale(locale)) {
    return {};
  }

  const isPortuguese = locale === 'pt';
  
  return generatePageMetadata({
    title: isPortuguese 
      ? 'Maída - Sabores Mediterrânicos. Alma Libanesa | Descobrir'
      : 'Maída - Mediterranean Flavours. Lebanese Soul | Discover',
    description: isPortuguese
      ? 'Histórias da nossa cozinha, das nossas raízes e da mesa. Tradições, sabores e momentos.'
      : 'Stories from our kitchen, our roots, and the table. Traditions, flavours, and moments.',
    path: '/blog',
    locale,
  });
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
