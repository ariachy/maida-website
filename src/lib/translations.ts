import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';
import { defaultLocale, isValidLocale, normalizeValue } from '@/lib/i18n';

/**
 * SERVER-ONLY translations loader.
 *
 * The runtime equivalent of i18n.ts `loadTranslations()`. That function uses a
 * build-time `import()` (and is shared with client components, so it must keep
 * using import and must never touch `fs`). The consequence is that editing a
 * locale JSON file does nothing until a rebuild — which is exactly why an admin
 * edit to homepage/footer/hero text "saved" but never appeared.
 *
 * This loader reads src/data/locales/<locale>.json from disk on each render, so
 * those edits go live with on-demand revalidation and no build. It applies the
 * SAME normalizeValue() as the client path (imported, not copied) so the shape
 * handed to components is identical.
 *
 * Marked `server-only`: importing it from a client component is a hard error.
 */

const LOCALES_DIR = path.join(process.cwd(), 'src', 'data', 'locales');

async function readLocaleFile(locale: string): Promise<Record<string, any>> {
  const full = path.join(LOCALES_DIR, `${locale}.json`);
  const raw = await fs.readFile(full, 'utf-8');
  return JSON.parse(raw);
}

export const getServerTranslations = cache(
  async (locale: string): Promise<Record<string, any>> => {
    const target = isValidLocale(locale) ? locale : defaultLocale;
    try {
      return normalizeValue(await readLocaleFile(target));
    } catch (error) {
      console.error(`Failed to load translations for ${target}:`, error);
      // Fallback to the default locale, mirroring loadTranslations().
      if (target !== defaultLocale) {
        try {
          return normalizeValue(await readLocaleFile(defaultLocale));
        } catch {
          return {};
        }
      }
      return {};
    }
  }
);
