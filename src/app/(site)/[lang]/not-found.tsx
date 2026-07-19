// src/app/(site)/[lang]/not-found.tsx
//
// Branded 404 for localised paths (/pt/anything-missing, /en/anything-missing).
//
// It is rendered by notFound() inside the [lang] segment, and is wrapped by
// (site)/[lang]/layout.tsx — which already provides <html>, <body>, fonts, Navbar and
// Footer. So this file renders CONTENT ONLY: no <html>, no metadata (the layout's title
// template covers it).
//
// The separate src/app/(standalone)/not-found.tsx handles locale-less paths (/xyz).

import NotFoundContent from '@/components/layout/NotFoundContent';

export default function LocaleNotFound() {
  return <NotFoundContent />;
}
