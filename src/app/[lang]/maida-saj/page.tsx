import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import SAJClient from '@/components/saj/SAJClient';

export async function generateMetadata({ params }: { params: { lang: string } }) {
  return {
    title: 'What is SAJ? | Traditional Lebanese Flatbread | Maída',
    description: 'Discover SAJ (Manoushe) - the traditional Lebanese flatbread baked fresh on our domed griddle. Crispy edges, soft center, endless possibilities. Try it at Maída in Lisbon.',
  };
}

export default async function SAJPage({
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
