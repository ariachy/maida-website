import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import Hero from '@/components/sections/Hero';
import Story from '@/components/sections/Story';
import MenuHighlights from '@/components/sections/MenuHighlights';
import Visit from '@/components/sections/Visit';
import CTASection from '@/components/sections/CTASection';

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
      <Hero translations={translations} locale={locale} />
      <Story translations={translations} locale={locale} />
      <MenuHighlights translations={translations} locale={locale} />
      <Visit translations={translations} locale={locale} />
      <CTASection translations={translations} />
    </>
  );
}
