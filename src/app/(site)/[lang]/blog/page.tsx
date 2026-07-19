import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale } from '@/lib/i18n';
import { getServerTranslations } from '@/lib/translations';
import { generatePageMetadata } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import BlogClient from '@/components/blog/BlogClient';
import { getBlogPosts } from '@/lib/content';

// See menu/page.tsx for the caching rationale. Busted by revalidateContent('blog').
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
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

  const [translations, posts] = await Promise.all([
    getServerTranslations(locale),
    getBlogPosts(),
  ]);

  const breadcrumbs = [
    { name: 'Maída', url: `https://maida.pt/${locale}` },
    { name: locale === 'pt' ? 'Descobrir' : 'Discover', url: `https://maida.pt/${locale}/blog` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <BlogClient translations={translations} locale={locale} posts={posts} />
    </>
  );
}
