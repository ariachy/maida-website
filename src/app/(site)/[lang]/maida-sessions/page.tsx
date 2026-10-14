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

  // Thursday mention follows the site-wide switch (contact.hours.thursday) so the
  // meta description never advertises a night the schedule does not show.
  const translations = await getServerTranslations(locale);
  const thursdayOn =
    typeof translations?.contact?.hours?.thursday === 'string' &&
    translations.contact.hours.thursday.trim() !== '';

  const description = isPortuguese
    ? thursdayOn
      ? 'Maída Sessions: DJs às quintas, sextas e sábados no Cais do Sodré. Quintas #MeetMeAtMaída - jantar a partir das 18h, DJ às 21h, até à 01:30.'
      : 'Maída Sessions: DJs às sextas e sábados no Cais do Sodré. Jantar a partir das 18h, DJ às 21h, noite até às 02:00.'
    : thursdayOn
      ? 'Maída Sessions: DJs on Thursdays, Fridays and Saturdays in Cais do Sodré. #MeetMeAtMaída Thursdays - dinner from 18:00, DJ from 21:00, open till 01:30.'
      : 'Maída Sessions: DJs on Fridays and Saturdays in Cais do Sodré. Dinner from 18:00, DJ from 21:00, open till late (02:00).';

  return generatePageMetadata({
    title: isPortuguese
      ? 'Maída Sessions - DJs e jantar no Cais do Sodré'
      : 'Maída Sessions - DJs and dinner in Cais do Sodré',
    description,
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
