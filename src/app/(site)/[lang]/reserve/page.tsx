import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale } from '@/lib/i18n';
import { getServerTranslations } from '@/lib/translations';
import { generatePageMetadata } from '@/lib/seo';
import ReserveClient from '@/components/booking/ReserveClient';

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
      ? 'Reservar Mesa | Maída Lisboa'
      : 'Book a Table | Maída Lisbon',
    description: isPortuguese
      ? 'Reserve a sua mesa no Maída em segundos. Sabores mediterrânicos com alma libanesa em Cais do Sodré, Lisboa. Pratos para partilhar, vinhos naturais e cocktails.'
      : 'Book your table at Maída in seconds. Mediterranean flavours with Lebanese soul in Cais do Sodré, Lisbon. Shareable plates, natural wines and cocktails.',
    path: '/reserve',
    locale,
  });
}

export default async function ReservePage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Runtime read (not build-time import) so hours edited in the admin go live on Publish.
  const translations = await getServerTranslations(locale);

  return <ReserveClient translations={translations} locale={locale} />;
}
