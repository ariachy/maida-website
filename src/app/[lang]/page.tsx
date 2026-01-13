import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import Hero from '@/components/sections/Hero';
import HeroCTA from '@/components/sections/HeroCTA';
import Story from '@/components/sections/Story';
import MenuHighlights from '@/components/sections/MenuHighlights';
import Visit from '@/components/sections/Visit';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maída - Mediterranean Flavours, Lebanese Soul',
  description: 'A gathering place for shared plates, natural wines, and evenings that linger. Restaurant-bar in Cais do Sodré, Lisboa.',
};

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
    <div className="overflow-x-hidden">
      <Hero translations={translations} />
      <HeroCTA locale={locale} />
      <Story translations={translations} locale={locale} />
      <MenuHighlights translations={translations} locale={locale} />
      <Visit translations={translations} locale={locale} />
    </div>
  );
}
