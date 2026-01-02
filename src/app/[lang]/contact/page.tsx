import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations } from '@/lib/i18n';
import ContactClient from '@/components/contact/ContactClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maída - Mediterranean Flavours, Lebanese Soul | Contact',
  description: 'Get in touch with Maída. Find us at Rua da Boavista 66, Cais do Sodré, Lisboa. Opening hours and reservations.',
};

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


