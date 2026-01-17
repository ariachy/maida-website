import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';

// Components
import Hero from '@/components/sections/Hero';
import HeroCTA from '@/components/sections/HeroCTA';
import Story from '@/components/sections/Story';
import MenuHighlights from '@/components/sections/MenuHighlights';
import Visit from '@/components/sections/Visit';

// Generate metadata with hreflang
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
      ? 'Maída – Sabores Mediterrânicos. Alma Libanesa | Lisboa'
      : 'Maída – Mediterranean Flavours. Lebanese Soul | Lisbon',
    description: isPortuguese
      ? 'Um lugar de encontro para pratos partilhados, vinhos naturais e noites que perduram. Restaurante-bar em Cais do Sodré, Lisboa.'
      : 'A gathering place for shared plates, natural wines, and evenings that linger. Restaurant-bar in Cais do Sodré, Lisbon.',
    path: '',
    locale,
  });
}

export default async function HomePage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const translations = await loadTranslations(locale);

  return (
    <>
      <Hero translations={translations} />
      <HeroCTA translations={translations} locale={locale} />
      <Story translations={translations} locale={locale} />
      <MenuHighlights translations={translations} locale={locale} />
      <Visit translations={translations} locale={locale} />
    </>
  );
}
