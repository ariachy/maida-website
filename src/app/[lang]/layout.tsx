import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, isValidLocale } from '@/lib/i18n';
import { getServerTranslations } from '@/lib/translations';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import PageLoader from '@/components/layout/PageLoader';
import NavigationLoader from '@/components/layout/NavigationLoader';
import CookieConsent from '@/components/consent/CookieConsent';

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const locale = params.lang;

  if (!isValidLocale(locale)) {
    return {};
  }

  // Build the hreflang map from the live locale set so it never points at
  // languages that aren't actually generated (de/it/es routes 404 today).
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `https://maida.pt/${l}`;
  languages['x-default'] = `https://maida.pt/en`;

  return {
    description:
      'A gathering place for shared plates, natural wines, and evenings that linger. Restaurant-bar in Cais do Sodré, Lisboa.',
    alternates: {
      canonical: `https://maida.pt/${locale}`,
      languages,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const locale = params.lang;

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Load translations from disk at request time (runtime, not build-time import)
  const translations = await getServerTranslations(locale);

  return (
    <>
      {/* Navigation loading indicator - shows progress bar when changing pages */}
      <Suspense fallback={null}>
        <NavigationLoader />
      </Suspense>

      {/* Page loader */}
      <PageLoader />

      {/* Noise texture overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Navigation */}
      <Navbar translations={translations} locale={locale} />

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <Footer translations={translations} locale={locale} />

      {/* Cookie Consent Banner */}
      <CookieConsent locale={locale} />
    </>
  );
}
