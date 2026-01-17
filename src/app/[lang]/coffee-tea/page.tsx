import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import CoffeeTeaClient from '@/components/coffee/CoffeeTeaClient';

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
      ? 'Maída - Sabores Mediterrânicos. Alma Libanesa | Café e Chá'
      : 'Maída - Mediterranean Flavours. Lebanese Soul | Coffee & Tea',
    description: isPortuguese
      ? 'Grãos de café especiais do Brasil e chás tradicionais mediterrânicos. De café com lavanda a chá de menta marroquino - calor mediterrânico em cada chávena.'
      : 'Specialty coffee beans from Brazil and traditional Mediterranean teas. From lavender coffee to Moroccan mint - Mediterranean warmth in every cup at Maída, Lisbon.',
    path: '/coffee-tea',
    locale,
  });
}

export default async function CoffeeTeaPage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;
  
  if (!isValidLocale(locale)) {
    notFound();
  }
  
  const translations = await loadTranslations(locale);
  
  return <CoffeeTeaClient translations={translations} locale={locale} />;
}
