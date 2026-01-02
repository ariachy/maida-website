import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import MaidaLiveClient from '@/components/maida-live/MaidaLiveClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maída - Mediterranean Flavours, Lebanese Soul | Maída Live',
  description: 'Experience Maída Live - our weekly program of music, culture, and atmosphere. Thursdays, Fridays, and Saturdays.',
};

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
