import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations } from '@/lib/i18n';
import MenuClient from '@/components/menu/MenuClient';
import menuData from '@/data/menu.json';

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const locale = params.lang;
  
  if (!isValidLocale(locale)) {
    return {};
  }
  
  const translations = await loadTranslations(locale);
  
  return {
    title: translations.menu?.title || 'Menu',
    description: `Explore the menu at maída - Mediterranean cuisine with Lebanese soul. ${translations.menu?.subtitle}`,
  };
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
