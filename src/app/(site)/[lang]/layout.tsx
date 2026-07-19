// src/app/(site)/[lang]/layout.tsx
//
// This is now a ROOT layout: it renders <html> and <body> itself. It replaces the old
// src/app/layout.tsx for every localised route.
//
// WHY: the old root layout sat above [lang], so it could never see params.lang — which
// is why <html lang="en"> was hardcoded and every Portuguese page told Google it was
// English. Root layouts cannot receive route params in the App Router. Route groups are
// the only way to get a real server-rendered lang attribute without forcing the whole
// site into dynamic rendering (the middleware + headers() approach would have done that,
// and this site relies on static generation + ISR — see `revalidate` in menu/page.tsx).
//
// The non-localised routes (/, /admin, /review, /meetmeatmaida) now get their own root
// layout at src/app/(standalone)/layout.tsx. Route groups do not affect URLs.

import { Suspense } from 'react';
import { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import '@/styles/globals.css';
import { locales, isValidLocale, type Locale } from '@/lib/i18n';
import { bcp47, generateAlternates } from '@/lib/seo';
import { getServerTranslations } from '@/lib/translations';
import {
  RestaurantJsonLd,
  OrganizationJsonLd,
  WebsiteJsonLd,
} from '@/components/seo/JsonLd';
import TrackingScripts from '@/components/integrations/TrackingScripts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import PageLoader from '@/components/layout/PageLoader';
import NavigationLoader from '@/components/layout/NavigationLoader';
import CookieConsent from '@/components/consent/CookieConsent';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
});

// html lang / hreflang share ONE implementation (src/lib/seo.ts). If they disagree the
// page contradicts itself, which is how <html lang="en"> ended up on every /pt page.
const htmlLang = bcp47;

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const locale = params.lang;
  if (!isValidLocale(locale)) return {};

  return {
    metadataBase: new URL('https://maida.pt'),
    title: {
      default: 'Maída - Mediterranean Flavours. Lebanese Soul | Lisbon',
      template: '%s | Maída',
    },
    description:
      'A gathering place for shared plates, natural wines, and evenings that linger. Restaurant-bar in Cais do Sodré, Lisboa.',
    keywords: [
      'Lebanese restaurant Lisbon',
      'Mediterranean restaurant',
      'Cais do Sodré restaurant',
      'best restaurants Lisbon',
      'shareable plates',
      'natural wine Lisbon',
      'mezze Lisbon',
      'cocktails Lisbon',
      'SAJ bread Lisbon',
      'brunch Lisbon',
    ],
    authors: [{ name: 'Maída' }],
    creator: 'Maída',
    publisher: 'Maída',
    formatDetection: { email: false, address: false, telephone: false },
    // Canonical + hreflang come from lib/seo, the same helper every page uses, so the
    // layout and the pages cannot disagree. (Metadata `alternates` is replaced wholesale
    // by a child that sets it — it does not merge — so both must be right.)
    alternates: generateAlternates('', locale),
    openGraph: {
      type: 'website',
      // og:locale uses underscore form, and is per-page, unlike hreflang.
      locale: locale === 'pt' ? 'pt_PT' : 'en_GB',
      alternateLocale: locale === 'pt' ? ['en_GB'] : ['pt_PT'],
      url: `https://maida.pt/${locale}/`,
      siteName: 'Maída',
      title: 'Maída - Mediterranean Flavours. Lebanese Soul',
      description:
        'A gathering place for shared plates, natural wines, and evenings that linger. Cais do Sodré, Lisbon.',
      images: [
        {
          url: '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Maída restaurant - Mediterranean flavours with Lebanese soul',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Maída - Mediterranean Flavours. Lebanese Soul',
      description:
        'A gathering place for shared plates, natural wines, and evenings that linger.',
      images: ['/images/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
    manifest: '/site.webmanifest',
    verification: { google: 'dxCpJe2DB0A9kR_LePgmhdA-bF7PyLGrHmYMep7TcGU' },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const locale = params.lang;
  if (!isValidLocale(locale)) notFound();

  const translations = await getServerTranslations(locale);

  return (
    <html lang={htmlLang(locale)} className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        {/* Preload hero image - CRITICAL for LCP */}
        <link
          rel="preload"
          href="/images/hero/maida-table.webp"
          as="image"
          type="image/webp"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
      </head>
      <body className="font-body bg-warm-white text-charcoal antialiased">
        <TrackingScripts />

        {/* Structured data — now locale-aware. The Menu graph itself is emitted by the
            menu route (MenuJsonLd), not here. */}
        <RestaurantJsonLd locale={locale} />
        <OrganizationJsonLd />
        <WebsiteJsonLd locale={locale} />

        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        <PageLoader />
        <div className="noise-overlay" aria-hidden="true" />
        <ScrollProgress />

        <Navbar translations={translations} locale={locale} />
        <main>{children}</main>
        <Footer translations={translations} locale={locale} />

        <CookieConsent locale={locale} />
      </body>
    </html>
  );
}
