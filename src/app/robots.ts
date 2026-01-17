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
          '/*?*',  // Block all URLs with query parameters
        ],
      },
    ],
    sitemap: 'https://maida.pt/sitemap.xml',
    host: 'https://maida.pt',
  };
}