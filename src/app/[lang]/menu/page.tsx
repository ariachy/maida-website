import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import MenuClient from '@/components/menu/MenuClient';
import menuData from '@/data/menu.json';

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
  
  const translations = await loadTranslations(locale);
  
  return <MenuClient translations={translations} menuData={menuData} locale={locale} />;
}
