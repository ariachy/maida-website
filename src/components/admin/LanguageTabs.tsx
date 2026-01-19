'use client';

import { useState } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
];

interface LanguageTabsProps {
  activeLanguage: string;
  onLanguageChange: (lang: string) => void;
  unsavedChanges?: Record<string, boolean>;
}

export default function LanguageTabs({
  activeLanguage,
  onLanguageChange,
  unsavedChanges = {},
}: LanguageTabsProps) {
  return (
    <div className="flex border-b border-[#E5E5E5]">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeLanguage === lang.code
              ? 'text-[#C4A484] border-b-2 border-[#C4A484] -mb-[1px]'
              : 'text-[#6B6B6B] hover:text-[#2C2C2C]'
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
          {unsavedChanges[lang.code] && (
            <span className="absolute top-2 right-1 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

// Export languages for use in other components
export { LANGUAGES };
export type { Language };
