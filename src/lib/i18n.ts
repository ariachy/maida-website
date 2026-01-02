// Supported languages
export const locales = ['en', 'pt', 'de', 'it', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

// Language names for display
export const languageNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
};

// Language flags (emoji)
export const languageFlags: Record<Locale, string> = {
  en: '🇬🇧',
  pt: '🇵🇹',
  de: '🇩🇪',
  it: '🇮🇹',
  es: '🇪🇸',
};

// Get nested value from object using dot notation
export function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path;
  }, obj);
}

// Load translations for a locale
export async function loadTranslations(locale: Locale): Promise<Record<string, any>> {
  try {
    // In a real app, this would fetch from an API
    // For now, we import the JSON files
    const translations = await import(`@/data/locales/${locale}.json`);
    return translations.default || translations;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // Fallback to English
    if (locale !== defaultLocale) {
      return loadTranslations(defaultLocale);
    }
    return {};
  }
}

// Check if locale is valid
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get locale from pathname
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const potentialLocale = segments[0];
  
  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  return defaultLocale;
}

// Remove locale prefix from pathname
export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const potentialLocale = segments[0];
  
  if (potentialLocale && isValidLocale(potentialLocale)) {
    return '/' + segments.slice(1).join('/') || '/';
  }
  
  return pathname;
}

// Add locale prefix to pathname
export function addLocaleToPathname(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromPathname(pathname);
  
  // Don't add locale prefix for default locale (optional - can be changed)
  // if (locale === defaultLocale) {
  //   return cleanPath;
  // }
  
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

// Get alternate URLs for all locales (for SEO)
export function getAlternateUrls(pathname: string, baseUrl: string): Record<Locale, string> {
  const cleanPath = removeLocaleFromPathname(pathname);
  
  return locales.reduce((acc, locale) => {
    acc[locale] = `${baseUrl}/${locale}${cleanPath === '/' ? '' : cleanPath}`;
    return acc;
  }, {} as Record<Locale, string>);
}
