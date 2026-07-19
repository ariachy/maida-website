import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { getServerTranslations } from '@/lib/translations';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import ContactClient from '@/components/contact/ContactClient';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
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

  const translations = await getServerTranslations(locale);

  const breadcrumbs = [
    { name: 'Maída', url: `https://maida.pt/${locale}` },
    {
      name: locale === 'pt' ? 'Contacto' : 'Contact',
      url: `https://maida.pt/${locale}/contact`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ContactClient translations={translations} locale={locale} />
    </>
  );
}
