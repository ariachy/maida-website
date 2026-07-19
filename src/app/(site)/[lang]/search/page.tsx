import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { getBlogPosts, type BlogPost } from '@/lib/content';

// Results depend on ?q=, so this must render per request.
export const dynamic = 'force-dynamic';

const T = {
  en: {
    title: 'Search',
    placeholder: 'Search the blog…',
    prompt: 'Type something to search our stories.',
    resultsFor: (q: string, n: number) =>
      `${n} ${n === 1 ? 'result' : 'results'} for “${q}”`,
    none: (q: string) => `Nothing found for “${q}”.`,
    read: 'Read',
  },
  pt: {
    title: 'Pesquisar',
    placeholder: 'Pesquisar no blog…',
    prompt: 'Escreva algo para pesquisar as nossas histórias.',
    resultsFor: (q: string, n: number) =>
      `${n} ${n === 1 ? 'resultado' : 'resultados'} para “${q}”`,
    none: (q: string) => `Nada encontrado para “${q}”.`,
    read: 'Ler',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const locale = params.lang;
  if (!isValidLocale(locale)) return {};

  const base = generatePageMetadata({
    title: locale === 'pt' ? 'Pesquisar | Maída' : 'Search | Maída',
    description:
      locale === 'pt'
        ? 'Pesquise nas histórias e no blog da Maída.'
        : 'Search Maída’s stories and blog.',
    path: '/search',
    locale,
  });

  // Crawlable (so the SearchAction target resolves) but kept out of the index
  // to avoid thin query-string pages competing for rankings.
  return { ...base, robots: { index: false, follow: true } };
}

// Strip inline markup/markers from blog content for plain-text matching + snippets.
function toPlainText(post: BlogPost): string {
  const blocks = post.content
    .map((b) => (b.text ? b.text : b.items ? b.items.join(' ') : ''))
    .join(' ');
  return `${post.title} ${post.subtitle} ${post.excerpt} ${post.tags.join(' ')} ${blocks}`
    .replace(/<[^>]+>/g, ' ') // anchor tags
    .replace(/\{\{[^}]+\}\}/g, ' ') // {{locale}} tokens
    .replace(/[*_`]/g, '') // markdown emphasis markers
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { lang: string };
  searchParams: { q?: string };
}) {
  const locale = params.lang;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = T[locale as 'en' | 'pt'];
  const q = (searchParams.q ?? '').trim();

  const posts = await getBlogPosts();

  const results =
    q.length === 0
      ? []
      : posts.filter((p) => toPlainText(p).toLowerCase().includes(q.toLowerCase()));

  const breadcrumbs = [
    { name: 'Maída', url: `https://maida.pt/${locale}` },
    { name: t.title, url: `https://maida.pt/${locale}/search` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="min-h-screen bg-[#F5F1EB] px-4 py-16">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="mb-6 font-serif text-4xl text-[#2C2C2C]">{t.title}</h1>

          {/* GET form → /[lang]/search?q=...  (no JS required, fully crawlable) */}
          <form action={`/${locale}/search`} method="get" className="mb-10 flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t.placeholder}
              aria-label={t.title}
              className="w-full rounded-md border border-[#D4C4B5] px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
            />
            <button
              type="submit"
              className="rounded-md bg-[#C4A484] px-5 py-2 font-medium text-white transition-colors hover:bg-[#B8956F]"
            >
              {t.title}
            </button>
          </form>

          {q.length === 0 ? (
            <p className="text-[#6B6B6B]">{t.prompt}</p>
          ) : results.length === 0 ? (
            <p className="text-[#6B6B6B]">{t.none(q)}</p>
          ) : (
            <>
              <p className="mb-6 text-sm text-[#6B6B6B]">{t.resultsFor(q, results.length)}</p>
              <ul className="space-y-8">
                {results.map((post) => (
                  <li key={post.id} className="border-b border-[#E3D9CC] pb-6">
                    <Link href={`/${locale}/blog/${post.slug}`} className="group block">
                      <h2 className="font-serif text-2xl text-[#2C2C2C] group-hover:text-[#B8956F]">
                        {post.title}
                      </h2>
                      <p className="mt-1 text-[#6B6B6B]">{post.subtitle}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-[#6B6B6B]">{post.excerpt}</p>
                      <span className="mt-2 inline-block text-sm font-medium text-[#C4A484]">
                        {t.read} →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
    </>
  );
}
