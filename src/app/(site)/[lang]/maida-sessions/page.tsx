import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { getServerTranslations } from '@/lib/translations';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import MaidaLiveClient from '@/components/maida-live/MaidaLiveClient';

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
      ? 'Maída Sessions - DJs e jantar no Cais do Sodré'
      : 'Maída Sessions - DJs and dinner in Cais do Sodré',
    description: isPortuguese
      ? 'Maída Sessions: DJs às quintas, sextas e sábados no Cais do Sodré. Quintas #MeetMeAtMaída - jantar a partir das 18h, DJ às 21h, até à 01:30.'
      : 'Maída Sessions: DJs on Thursdays, Fridays and Saturdays in Cais do Sodré. #MeetMeAtMaída Thursdays - dinner from 18:00, DJ from 21:00, open till 01:30.',
    path: '/maida-sessions',
    locale,
  });
}

export default async function MaidaSessionsPage({
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
    { name: 'Maída Sessions', url: `https://maida.pt/${locale}/maida-sessions/` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <MaidaLiveClient translations={translations} locale={locale} />
    </>
  );
}
