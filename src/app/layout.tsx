import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';
import { RestaurantJsonLd, OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd';
import UmaiLoader from '@/components/integrations/UmaiLoader';

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
    default: 'Maída – Mediterranean Flavours. Lebanese Soul | Lisbon',
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
    title: 'Maída – Mediterranean Flavours. Lebanese Soul',
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
    title: 'Maída – Mediterranean Flavours. Lebanese Soul',
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
    google: 'google4b903f4f9499dd80',
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
        <link rel="preconnect" href="https://widget.letsumai.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS prefetch for resources loaded later */}
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />

        {/* ===========================================
            GTM Consent Mode - MUST load BEFORE GTM
            =========================================== */}
        <Script id="gtm-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){dataLayer.push(arguments);}
            
            // Set default consent to denied
            window.gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'functionality_storage': 'denied',
              'personalization_storage': 'denied',
              'security_storage': 'granted',
              'wait_for_update': 500
            });
            
            // Enable URL passthrough for better analytics
            window.gtag('set', 'url_passthrough', true);
            
            // Enable ads data redaction when consent denied
            window.gtag('set', 'ads_data_redaction', true);
          `}
        </Script>

        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MZ83M6VJ');
          `}
        </Script>

        {/* UMAI Widget is now loaded via UmaiLoader component after user interaction */}
      </head>
      <body className="font-body bg-warm-white text-charcoal antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MZ83M6VJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* Structured Data for SEO */}
        <RestaurantJsonLd />
        <OrganizationJsonLd />
        <WebsiteJsonLd />

        {/* UMAI Loader - loads widget after user interaction (scroll, click, etc.) */}
        <UmaiLoader />

        {children}
      </body>
    </html>
  );
}
