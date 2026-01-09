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

/**
 * ROOT CAUSE FIX: Normalizes translation values to plain strings.
 * Handles both simple strings and {label, value} objects that may exist in JSON files.
 */
function normalizeValue(value: any): any {
  // Null/undefined pass through
  if (value === null || value === undefined) {
    return value;
  }
  
  // Strings pass through
  if (typeof value === 'string') {
    return value;
  }
  
  // Arrays: normalize each item
  if (Array.isArray(value)) {
    return value.map(item => normalizeValue(item));
  }
  
  // Objects: check for {label, value} format or recurse
  if (typeof value === 'object') {
    // Handle {label, value} format - extract the string
    if ('value' in value && typeof value.value === 'string') {
      return value.value;
    }
    if ('label' in value && typeof value.label === 'string') {
      return value.label;
    }
    
    // Regular nested object - recurse
    const normalized: Record<string, any> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        normalized[key] = normalizeValue(value[key]);
      }
    }
    return normalized;
  }
  
  // Numbers, booleans, etc. pass through
  return value;
}

// Get nested value from object using dot notation
export function getNestedValue(obj: any, path: string): string {
  const value = path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path;
  }, obj);
  
  // Normalize in case it's an object
  const normalized = normalizeValue(value);
  return typeof normalized === 'string' ? normalized : path;
}

// Load translations for a locale
export async function loadTranslations(locale: Locale): Promise<Record<string, any>> {
  try {
    // In a real app, this would fetch from an API
    // For now, we import the JSON files
    const translations = await import(`@/data/locales/${locale}.json`);
    const raw = translations.default || translations;
    
    // CRITICAL FIX: Normalize all values to handle {label, value} format
    return normalizeValue(raw);
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
