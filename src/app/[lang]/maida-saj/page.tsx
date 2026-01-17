import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import SAJClient from '@/components/saj/SAJClient';

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
      ? 'Maída - Sabores Mediterrânicos. Alma Libanesa | O que é SAJ?'
      : 'Maída - Mediterranean Flavours. Lebanese Soul | What is SAJ?',
    description: isPortuguese
      ? 'SAJ é um pão achatado tradicional libanês cozido numa chapa convexa. Descubra esta tradição milenar no Maída, Lisboa.'
      : 'SAJ is a traditional Lebanese flatbread cooked on a convex dome griddle. Discover this centuries-old tradition at Maída, Lisbon.',
    path: '/maida-saj',
    locale,
  });
}

export default async function SajPage({
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
