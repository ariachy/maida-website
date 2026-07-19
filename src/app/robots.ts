import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          // NOTE: the previous `'/*?*'` rule blocked EVERY query-string URL,
          // which would have made the new ?q= search results page (and the
          // SearchAction that points at it) uncrawlable. It is removed.
          //
          // Duplicate-content risk from tracking params (utm_*, etc.) is handled
          // by the canonical tags emitted in generatePageMetadata(), which is the
          // correct tool for that — not a robots block.
          //
          // The search results page itself is set to noindex,follow in its own
          // metadata, so it is crawlable (SearchAction works) but not indexed.
        ],
      },
    ],
    sitemap: 'https://maida.pt/sitemap.xml',
    host: 'https://maida.pt',
  };
}
