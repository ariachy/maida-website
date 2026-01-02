import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations } from '@/lib/i18n';
import MenuClient from '@/components/menu/MenuClient';
import menuData from '@/data/menu.json';

export const metadata: Metadata = {
  title: 'Maída - Mediterranean Flavours, Lebanese Soul | Menu',
  description: 'Explore our Mediterranean menu with Lebanese soul. Mezze, main courses, grilled dishes, signature cocktails and more.',
};

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
