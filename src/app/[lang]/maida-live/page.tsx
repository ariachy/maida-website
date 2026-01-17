import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import MaidaLiveClient from '@/components/maida-live/MaidaLiveClient';

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
      ? 'Maída - Sabores Mediterrânicos. Alma Libanesa | Maída Live'
      : 'Maída - Mediterranean Flavours. Lebanese Soul | Maída Live',
    description: isPortuguese
      ? 'Experimente o Maída Live - o nosso programa semanal de música, cultura e atmosfera. Quintas, sextas e sábados.'
      : 'Experience Maída Live - our weekly program of music, culture, and atmosphere. Thursdays, Fridays, and Saturdays.',
    path: '/maida-live',
    locale,
  });
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
