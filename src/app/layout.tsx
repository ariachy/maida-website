import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import '@/styles/globals.css';

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
  title: {
    default: 'maída — Mediterranean Flavours. Lebanese Soul | Lisbon',
    template: '%s | maída',
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
  ],
  authors: [{ name: 'maída' }],
  creator: 'maída',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://maida.pt',
    siteName: 'maída',
    title: 'maída — Mediterranean Flavours. Lebanese Soul',
    description:
      'A gathering place for shared plates, natural wines, and evenings that linger. Cais do Sodré, Lisbon.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'maída restaurant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'maída — Mediterranean Flavours. Lebanese Soul',
    description:
      'A gathering place for shared plates, natural wines, and evenings that linger.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MZ83M6VJ');`,
          }}
        />
        {/* UMAI Widget */}
        <script
          src="https://widget.letsumai.com/dist/embed.min.js"
          data-api-key="d541f212-d5ca-4839-ab2b-7f9c99e1c96c"
          data-widget-type="reservation"
          defer
        />
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
        
        {children}
      </body>
    </html>
  );
}
