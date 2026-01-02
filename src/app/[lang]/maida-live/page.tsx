import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import MaidaLiveClient from '@/components/maida-live/MaidaLiveClient';

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const locale = params.lang as Locale;
  
  return {
    title: 'Maída Live - Events & DJ Nights | Maída',
    description: 'Experience Maída Live — Thursday cultural nights, Friday DJ dinners, and Saturday parties until 2am. Where dinner becomes an experience.',
  };
}

export default async function MaidaLivePage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;
  
  if (!isValidLocale(locale)) {
    notFound();
  }
  
  const translations = await loadTranslations(locale);
  
  return <MaidaLiveClient translations={translations} locale={locale} />;
}
