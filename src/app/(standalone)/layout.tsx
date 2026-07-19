// src/app/(standalone)/layout.tsx
//
// Second ROOT layout, for the routes that live outside /[lang]:
//   /            (src/app/(standalone)/page.tsx — the locale redirect)
//   /admin/**    (the CMS)
//   /review      (review capture)
//   /meetmeatmaida
//
// These are either English-only or non-public, so lang="en" is correct and static here.
// Route groups don't affect URLs — /admin stays /admin.
//
// Deliberately does NOT render the Restaurant/Website JSON-LD: that markup is
// locale-aware now and belongs on the public localised pages. Emitting it from /admin
// would duplicate the @id nodes for no benefit.

import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import '@/styles/globals.css';

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

export const metadata: Metadata = {
  metadataBase: new URL('https://maida.pt'),
  title: 'Maída',
  // Admin/review surfaces must not be indexed. The public localised pages set their own
  // robots directives in (site)/[lang]/layout.tsx.
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

export default function StandaloneRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="font-body bg-warm-white text-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}
