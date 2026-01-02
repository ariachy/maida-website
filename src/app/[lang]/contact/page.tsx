import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations } from '@/lib/i18n';
import ContactClient from '@/components/contact/ContactClient';

export default async function ContactPage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;
  
  if (!isValidLocale(locale)) {
    notFound();
  }
  
  const translations = await loadTranslations(locale);
  
  return <ContactClient translations={translations} locale={locale} />;
}
