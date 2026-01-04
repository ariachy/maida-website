import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import SAJClient from '@/components/saj/SAJClient';

export async function generateMetadata({ params }: { params: { lang: string } }) {
  return {
    title: 'Maída - Mediterranean Flavours, Lebanese Soul | Maída SAJ',
    description: 'Traditional Lebanese flatbread, cooked fresh on a Saj griddle. Crispy, soft, and light - perfect for wraps or with dips. Try it at Maída in Lisbon.',
  };
}

export default async function SAJPage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;
  
  if (!isValidLocale(locale)) {
    notFound();
  }
  
  const translations = await loadTranslations(locale);
  
  return <SAJClient translations={translations} locale={locale} />;
}
