// src/app/(site)/[lang]/faq/page.tsx
//
// Localized FAQ page. Server component (no interactivity needed) so the JSON-LD renders
// server-side and no JS ships for the page. Statically generated per-locale via the
// [lang] layout's generateStaticParams, exactly like /[lang]/maida-saj.
//
// Content is hardcoded in the locale dictionaries under the `faq` key (en.json / pt.json)
// and is NOT admin-managed — edits go live on the next server build, like the rest of the
// dictionary-driven copy.

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { isValidLocale, loadTranslations, Locale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { FAQPageJsonLd } from '@/components/seo/JsonLd';

// An answer is an array of segments. A segment is plain text, an internal link (`to`,
// locale-prefixed at render), or an external link (`href`, used as-is: tel:/https:/…).
// All segments render inline AND contribute to the plain-text schema answer.
type Segment = { t: string; to?: string; href?: string };

// Optional trailing call-to-action (e.g. "Get directions →"). Rendered as an affordance
// under the answer and intentionally EXCLUDED from the plain-text schema answer.
type Cta = { t: string; to?: string; href?: string };

type FaqItem = { q: string; a: Segment[]; cta?: Cta };

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
      ? 'Maída - Perguntas Frequentes | Cais do Sodré, Lisboa'
      : 'Maída - Frequently Asked Questions | Cais do Sodré, Lisbon',
    description: isPortuguese
      ? 'Respostas às perguntas mais comuns sobre a Maída — horário, reservas, localização, opções vegetarianas e mais, em Cais do Sodré, Lisboa.'
      : 'Answers to the most common questions about Maída — opening hours, reservations, location, vegetarian options and more, in Cais do Sodré, Lisbon.',
    path: '/faq',
    locale,
  });
}

// Plain-text answer for FAQPage schema: concatenate the inline answer segments only.
// The `cta` link is excluded and the data carries no bracket/arrow markup, so
// acceptedAnswer.text is clean plain text by construction.
function plainAnswer(item: FaqItem): string {
  return item.a
    .map((s) => s.t)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function FaqPage({
  params,
}: {
  params: { lang: string };
}) {
  const locale = params.lang;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const translations = await loadTranslations(locale as Locale);
  const faq = (translations as any)?.faq ?? {};
  const items: FaqItem[] = Array.isArray(faq.items) ? faq.items : [];

  const withLocale = (to: string) =>
    `/${locale}${to.startsWith('/') ? '' : '/'}${to}`;
  const isExternal = (href?: string) => (href ? /^https?:\/\//.test(href) : false);

  const linkClass =
    'text-terracotta underline underline-offset-2 hover:text-charcoal transition-colors';

  const renderSegment = (s: Segment, i: number) => {
    if (s.to) {
      return (
        <Link key={i} href={withLocale(s.to)} className={linkClass}>
          {s.t}
        </Link>
      );
    }
    if (s.href) {
      return (
        <a
          key={i}
          href={s.href}
          {...(isExternal(s.href)
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
          className={linkClass}
        >
          {s.t}
        </a>
      );
    }
    return <span key={i}>{s.t}</span>;
  };

  const renderCta = (cta: Cta) => {
    const cls =
      'inline-flex items-center gap-1 mt-2 text-sm text-terracotta hover:text-charcoal transition-colors';
    if (cta.to) {
      return (
        <Link href={withLocale(cta.to)} className={cls}>
          {cta.t} <span aria-hidden="true">→</span>
        </Link>
      );
    }
    return (
      <a
        href={cta.href}
        {...(isExternal(cta.href)
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
        className={cls}
      >
        {cta.t} <span aria-hidden="true">→</span>
      </a>
    );
  };

  const schemaItems = items.map((it) => ({
    question: it.q,
    answer: plainAnswer(it),
  }));

  return (
    <>
      <FAQPageJsonLd items={schemaItems} locale={locale as Locale} />

      <section className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <header className="mb-10 md:mb-14 text-center">
          <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-3">
            {faq.heroTitle ||
              (locale === 'pt'
                ? 'Perguntas Frequentes'
                : 'Frequently Asked Questions')}
          </h1>
          {faq.heroSubtitle && (
            <p className="text-charcoal/60 text-base md:text-lg">
              {faq.heroSubtitle}
            </p>
          )}
        </header>

        <dl className="divide-y divide-charcoal/10">
          {items.map((item, idx) => (
            <div key={idx} className="py-6 md:py-7">
              <dt className="font-display text-xl md:text-2xl text-charcoal mb-2">
                {item.q}
              </dt>
              <dd className="text-charcoal/80 leading-relaxed">
                {/*
                  FUTURE (hours): the opening-hours answer is hardcoded in the locale
                  dictionaries (faq.items → the hours Q), matching how the rest of the
                  site hardcodes hours today. When the DB-driven hours system lands, wire
                  this answer — and footer.hoursValue, contact.hours.*, reserve.hours*,
                  homeVisit/visit hours, JSON-LD OPENING_HOURS, and the meetmeatmaida
                  footer_hours setting — into that single source so they can't drift.
                */}
                <p>{item.a.map(renderSegment)}</p>
                {item.cta && renderCta(item.cta)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
