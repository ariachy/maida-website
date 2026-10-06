'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Locale, locales, languageNames, addLocaleToPathname, removeLocaleFromPathname } from '@/lib/i18n';

interface LanguageSwitcherProps {
  locale: Locale;
  compact?: boolean;
}

/**
 * Both languages are always visible as "EN | PT": one tap switches, nothing to open,
 * nothing to decode. (A globe icon or flags are easy to miss; flags also stand for
 * countries rather than languages.)
 */
export default function LanguageSwitcher({ locale, compact = false }: LanguageSwitcherProps) {
  const pathname = usePathname();

  const getLocalePath = (targetLocale: Locale) => {
    const cleanPath = removeLocaleFromPathname(pathname);
    return addLocaleToPathname(cleanPath, targetLocale);
  };

  return (
    <nav
      aria-label="Language"
      className={`flex items-center ${compact ? 'gap-1 text-[13px]' : 'gap-1.5 text-sm'} font-nav tracking-wide`}
    >
      {locales.map((loc, i) => {
        const active = loc === locale;
        return (
          <span key={loc} className="flex items-center">
            {i > 0 && <span className="mx-1 text-stone/40 select-none" aria-hidden>|</span>}
            <Link
              href={getLocalePath(loc)}
              hrefLang={loc}
              lang={loc}
              aria-current={active ? 'true' : undefined}
              aria-label={languageNames[loc]}
              className={`${compact ? 'px-1.5 py-2' : 'px-1.5 py-1'} uppercase transition-colors ${
                active ? 'text-terracotta font-medium underline underline-offset-4 decoration-terracotta/60' : 'text-stone hover:text-charcoal'
              }`}
            >
              {loc}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
