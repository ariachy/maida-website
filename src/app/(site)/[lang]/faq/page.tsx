// src/app/(site)/[lang]/faq/page.tsx
//
// Localized FAQ page. Server component (no interactivity needed) so the JSON-LD renders
// server-side and no JS ships for the page. Statically generated per-locale via the
// [lang] layout's generateStaticParams, exactly like /[lang]/maida-saj.
//
// Content lives in the locale dictionaries under the `faq` key (en.json / pt.json). There
// is no admin editor for it, but the dictionaries are read at runtime
// (getServerTranslations), so a JSON edit + Publish goes live without a build. The
// opening-hours answer is special: its `{ hours: true }` segment is composed at render
// time from contact.hours.* - the admin-managed hours (Content → Contact → Opening
// Hours) - so the FAQ can never contradict the reserve page, the footer or the schema.

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { isValidLocale, Locale } from '@/lib/i18n';
import { getServerTranslations } from '@/lib/translations';
import { generatePageMetadata } from '@/lib/seo';
import { FAQPageJsonLd } from '@/components/seo/JsonLd';

// An answer is an array of segments. A segment is plain text, an internal link (`to`,
// locale-prefixed at render), an external link (`href`, used as-is: tel:/https:/…), or
// `{ hours: true }`, replaced at render by the opening hours composed from contact.hours.
// All segments render inline AND contribute to the plain-text schema answer.
type Segment = { t: string; to?: string; href?: string; hours?: boolean };

// "Wed - Mon: 18:00 - 23:30, kitchen closes 23:00. [Thu…]. Fri - Sat: …, kitchen closes
// 23:30. Tuesday: Closed." - built from the same admin fields as every other hours line.
// The kitchen note is lower-cased at its first letter so it reads as a clause.
function composeHoursAnswer(hours: Record<string, any>): string {
  const str = (k: string) => (typeof hours?.[k] === 'string' ? hours[k].trim() : '');
  const clause = (k: string) => {
    const v = str(k);
    return v ? `, ${v.charAt(0).toLowerCase()}${v.slice(1)}` : '';
  };
  const parts: string[] = [];
  if (str('midweek')) parts.push(`${str('midweek')}${clause('midweekKitchen')}`);
  if (str('thursday')) parts.push(str('thursday'));
  if (str('weekend')) parts.push(`${str('weekend')}${clause('weekendKitchen')}`);
  if (str('closed')) parts.push(str('closed'));
  return parts.map((p) => `${p}.`).join(' ');
}

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
      ? 'Respostas às perguntas mais comuns sobre a Maída - horário, reservas, localização, opções vegetarianas e mais, em Cais do Sodré, Lisboa.'
      : 'Answers to the most common questions about Maída - opening hours, reservations, location, vegetarian options and more, in Cais do Sodré, Lisbon.',
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

  const translations = await getServerTranslations(locale as Locale);
  const faq = (translations as any)?.faq ?? {};
  const hoursAnswer = composeHoursAnswer((translations as any)?.contact?.hours ?? {});
  const items: FaqItem[] = (Array.isArray(faq.items) ? (faq.items as FaqItem[]) : []).map(
    (item) => ({
      ...item,
      a: item.a.map((seg) => (seg.hours ? { t: hoursAnswer } : seg)),
    })
  );

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
