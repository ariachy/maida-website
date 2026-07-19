import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import PrivacyClient from '@/components/privacy/PrivacyClient';

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
      ? 'Maída – Política de Privacidade'
      : 'Maída – Privacy Policy',
    description: isPortuguese
      ? 'Política de Privacidade do restaurante Maída. Como recolhemos, utilizamos e protegemos os seus dados pessoais.'
      : 'Maída restaurant Privacy Policy. How we collect, use and protect your personal data.',
    path: '/privacy',
    locale,
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const translations = await loadTranslations(locale);

  return <PrivacyClient translations={translations} locale={locale as Locale} />;
}
