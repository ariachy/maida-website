import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import StoryClient from '@/components/story/StoryClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maída - Mediterranean Flavours, Lebanese Soul | Our Story',
  description: 'Discover the story behind Maída - from Beirut to Lisboa. A gathering table in the heart of Lisbon.',
};

export default async function StoryPage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;
  
  if (!isValidLocale(locale)) {
    notFound();
  }
  
  const translations = await loadTranslations(locale);
  
  return <StoryClient translations={translations} locale={locale} />;
}
