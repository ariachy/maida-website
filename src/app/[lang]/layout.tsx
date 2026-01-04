import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, Locale, isValidLocale, loadTranslations } from '@/lib/i18n';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import PageLoader from '@/components/layout/PageLoader';
import NavigationLoader from '@/components/layout/NavigationLoader';

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string } 
}): Promise<Metadata> {
  const locale = params.lang;
  
  if (!isValidLocale(locale)) {
    return {};
  }
  
  const translations = await loadTranslations(locale);
  
  return {
    // SEO Title Template - all pages will use this format
    description: 'A gathering place for shared plates, natural wines, and evenings that linger. Restaurant-bar in Cais do Sodré, Lisboa.',
    alternates: {
      canonical: `https://maida.pt/${locale}`,
      languages: {
        'en': '/en',
        'pt': '/pt',
        'de': '/de',
        'it': '/it',
        'es': '/es',
      },
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
  
  // Load translations
  const translations = await loadTranslations(locale);
  
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
    </>
  );
}