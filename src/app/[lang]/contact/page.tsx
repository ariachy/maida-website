import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale, loadTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import ContactClient from '@/components/contact/ContactClient';

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
      ? 'Maída - Sabores Mediterrânicos. Alma Libanesa | Contacto'
      : 'Maída - Mediterranean Flavours. Lebanese Soul | Contact',
    description: isPortuguese
      ? 'Encontre-nos na Rua da Boavista 66, Cais do Sodré, Lisboa. Horário de funcionamento e reservas.'
      : 'Get in touch with Maída. Find us at Rua da Boavista 66, Cais do Sodré, Lisboa. Opening hours and reservations.',
    path: '/contact',
    locale,
  });
}

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
