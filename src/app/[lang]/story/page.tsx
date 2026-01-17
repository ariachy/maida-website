import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import StoryClient from '@/components/story/StoryClient';

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
      ? 'Maída - Sabores Mediterrânicos. Alma Libanesa | A Nossa História'
      : 'Maída - Mediterranean Flavours. Lebanese Soul | Our Story',
    description: isPortuguese
      ? 'Descubra a história do Maída - de Beirute a Lisboa. Uma mesa de encontro no coração de Lisboa.'
      : 'Discover the story behind Maída - from Beirut to Lisboa. A gathering table in the heart of Lisbon.',
    path: '/story',
    locale,
  });
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
