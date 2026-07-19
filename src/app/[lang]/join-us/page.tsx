import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isValidLocale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import JoinUsClient from './JoinUsClient';

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
      ? 'Maída - Sabores Mediterrânicos. Alma Libanesa | Junta-te a Nós'
      : 'Join Us | Maída Lisbon',
    description: isPortuguese
      ? 'Junta-te à equipa Maída em Lisboa. Estamos a contratar para Cozinha, Bar e Sala. Candidata-te online com o teu CV.'
      : 'Join the Maída team in Lisbon. We are hiring for Kitchen, Bar, and Floor positions. Apply online with your CV.',
    path: '/join-us',
    locale,
  });
}

export default function JoinUsPage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Note: this page is intentionally English-only inside the form itself,
  // even under [lang]. The metadata is localized so search engines and
  // social previews look right in both languages, but the form content
  // stays in English on purpose.
  return <JoinUsClient locale={locale} />;
}
