'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useConsent } from '@/hooks/useConsent';

// Create context with the return type of useConsent
type ConsentContextType = ReturnType<typeof useConsent>;

const ConsentContext = createContext<ConsentContextType | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const consent = useConsent();
  
  return (
    <ConsentContext.Provider value={consent}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsentContext() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsentContext must be used within a ConsentProvider');
  }
  return context;
}
