import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import StoryClient from '@/components/story/StoryClient';

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const locale = params.lang as Locale;
  const translations = await loadTranslations(locale);
  
  return {
    title: translations?.story?.meta?.title || 'Our Story - Maída',
    description: translations?.story?.meta?.description || 'Discover the meaning behind Maída - where Mediterranean flavours meet Lebanese soul in the heart of Lisbon.',
  };
}

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
