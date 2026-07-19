// src/app/(site)/[lang]/menu/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale } from '@/lib/i18n';
import { getServerTranslations } from '@/lib/translations';
import { generatePageMetadata } from '@/lib/seo';
import { BreadcrumbJsonLd, MenuJsonLd } from '@/components/seo/JsonLd';
import MenuClient from '@/components/menu/MenuClient';
import { getMenuData } from '@/lib/content';

// Stays statically rendered for speed. On publish, revalidateContent('menu')
// busts this route's cache and the next request re-reads menu.json from disk.
// `revalidate` is a safety net: even if a revalidation call is missed, the page
// self-refreshes at most hourly. No `next build` required either way.
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
      ? 'Maída - Sabores Mediterrânicos. Alma Libanesa | Menu'
      : 'Maída - Mediterranean Flavours. Lebanese Soul | Menu',
    description: isPortuguese
      ? 'Explore o nosso menu mediterrânico com alma libanesa. Mezze, pratos principais, grelhados, cocktails de assinatura e mais.'
      : 'Explore our Mediterranean menu with Lebanese soul. Mezze, main courses, grilled dishes, signature cocktails and more.',
    path: '/menu',
    locale,
  });
}

export default async function MenuPage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Read translations (client-safe path) and menu content (server-only, from disk).
  const [translations, menuData] = await Promise.all([
    getServerTranslations(locale),
    getMenuData(),
  ]);

  const breadcrumbs = [
    { name: 'Maída', url: `https://maida.pt/${locale}/` },
    { name: 'Menu', url: `https://maida.pt/${locale}/menu/` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {/* Full Menu -> MenuSection -> MenuItem graph in this page's language, generated
          from the same menuData + translations the page renders, so the markup can never
          describe a menu different from the visible one. */}
      <MenuJsonLd menuData={menuData} translations={translations} locale={locale} />
      <MenuClient translations={translations} menuData={menuData} locale={locale} />
    </>
  );
}
