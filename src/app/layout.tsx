import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { RestaurantJsonLd, OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd';
import TrackingScripts from '@/components/integrations/TrackingScripts';

// Font configurations
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

// Base metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://maida.pt'),
  title: {
    default: 'Maída - Mediterranean Flavours. Lebanese Soul | Lisbon',
    template: '%s | Maída',
  },
  description:
    'Maída is a Mediterranean restaurant with Lebanese soul in Cais do Sodré, Lisbon. Shareable plates, natural wines, and signature cocktails.',
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://maida.pt',
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
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'dxCpJe2DB0A9kR_LePgmhdA-bF7PyLGrHmYMep7TcGU',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        {/* ===========================================
            PERFORMANCE: Preload & Preconnect
            =========================================== */}

        {/* Preload hero image - CRITICAL for LCP */}
        <link
          rel="preload"
          href="/images/hero/maida-table.webp"
          as="image"
          type="image/webp"
        />

        {/* Preconnect to external domains (reduces DNS/TCP/TLS time) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* DNS prefetch for resources loaded later */}
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
      </head>
      <body className="font-body bg-warm-white text-charcoal antialiased">
        {/* Tracking Scripts - excludes /review page */}
        <TrackingScripts />

        {/* Structured Data for SEO */}
        <RestaurantJsonLd />
        <OrganizationJsonLd />
        <WebsiteJsonLd />

        {children}
      </body>
    </html>
  );
}
