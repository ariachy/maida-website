import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import CoffeeTeaClient from '@/components/coffee/CoffeeTeaClient';

export async function generateMetadata({ params }: { params: { lang: string } }) {
  return {
    title: 'Coffee & Tea | Lebanese Traditions | Maída',
    description: 'Specialty coffee from Baobá roasters, traditional Lebanese teas, and our signature Lavender Coffee. Discover the coffee culture at Maída in Lisbon.',
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
