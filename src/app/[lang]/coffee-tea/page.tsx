import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import CoffeeTeaClient from '@/components/coffee/CoffeeTeaClient';

export async function generateMetadata({ params }: { params: { lang: string } }) {
  return {
    title: 'Maída - Mediterranean Flavours, Lebanese Soul | Coffee & Tea',
    description: 'Specialty coffee beans from Brazil and traditional Mediterranean teas. From lavender coffee to Moroccan mint - Mediterranean warmth in every cup at Maída, Lisbon.',
  };
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
