'use client';

import { useCallback } from 'react';
import { getNestedValue, Locale } from '@/lib/i18n';

// This hook will be used with translations passed from server components
export function useTranslation(translations: Record<string, any>) {
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let value = getNestedValue(translations, key);
      
      // Handle missing translation
      if (value === key) {
        console.warn(`Missing translation for key: ${key}`);
        return key;
      }
      
      // Replace parameters if provided
      if (params && typeof value === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
        });
      }
      
      return value;
    },
    [translations]
  );

  return { t };
}

// Simple translation function for server components
export function createTranslator(translations: Record<string, any>) {
  return (key: string, params?: Record<string, string | number>) => {
    let value = getNestedValue(translations, key);
    
    if (value === key) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    
    if (params && typeof value === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
    }
    
    return value;
  };
}
