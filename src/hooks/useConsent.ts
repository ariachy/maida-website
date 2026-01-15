'use client';

import { useState, useEffect, useCallback } from 'react';

// Consent categories
export interface ConsentState {
  necessary: boolean; // Always true
  analytics: boolean;
  functional: boolean;
  advertising: boolean;
}

// Default consent (only necessary enabled)
const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  functional: false,
  advertising: false,
};

// Storage key
const CONSENT_STORAGE_KEY = 'maida_cookie_consent';
const CONSENT_TIMESTAMP_KEY = 'maida_consent_timestamp';

// Extend Window interface for GTM dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [hasConsented, setHasConsented] = useState<boolean | null>(null); // null = loading
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ConsentState;
        setConsent({ ...parsed, necessary: true }); // Ensure necessary is always true
        setHasConsented(true);
        
        // Update GTM consent state
        updateGTMConsent(parsed);
      } catch {
        // Invalid stored consent, show banner
        setHasConsented(false);
        setShowBanner(true);
      }
    } else {
      // No stored consent, show banner
      setHasConsented(false);
      setShowBanner(true);
      
      // Set default (denied) consent in GTM
      updateGTMConsent(DEFAULT_CONSENT);
    }
  }, []);

  // Update GTM Consent Mode
  const updateGTMConsent = useCallback((consentState: ConsentState) => {
    if (typeof window === 'undefined') return;

    // Initialize dataLayer if not exists
    window.dataLayer = window.dataLayer || [];
    
    // Push consent event for GTM triggers
    window.dataLayer.push({
      'event': 'consent_update',
      'consent_analytics': consentState.analytics,
      'consent_functional': consentState.functional,
      'consent_advertising': consentState.advertising,
    });

    // Use gtag for consent update (must be defined on window)
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': consentState.analytics ? 'granted' : 'denied',
        'ad_storage': consentState.advertising ? 'granted' : 'denied',
        'ad_user_data': consentState.advertising ? 'granted' : 'denied',
        'ad_personalization': consentState.advertising ? 'granted' : 'denied',
        'functionality_storage': consentState.functional ? 'granted' : 'denied',
        'personalization_storage': consentState.functional ? 'granted' : 'denied',
        'security_storage': 'granted',
      });
    } else {
      // Fallback: push to dataLayer in gtag format
      window.dataLayer.push([
        'consent', 
        'update', 
        {
          'analytics_storage': consentState.analytics ? 'granted' : 'denied',
          'ad_storage': consentState.advertising ? 'granted' : 'denied',
          'ad_user_data': consentState.advertising ? 'granted' : 'denied',
          'ad_personalization': consentState.advertising ? 'granted' : 'denied',
          'functionality_storage': consentState.functional ? 'granted' : 'denied',
          'personalization_storage': consentState.functional ? 'granted' : 'denied',
          'security_storage': 'granted',
        }
      ]);
    }
  }, []);

  // Save consent to localStorage and update GTM
  const saveConsent = useCallback((newConsent: ConsentState) => {
    const consentWithNecessary = { ...newConsent, necessary: true };
    
    // Save to localStorage
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentWithNecessary));
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
    
    // Update state
    setConsent(consentWithNecessary);
    setHasConsented(true);
    setShowBanner(false);
    setShowPreferences(false);
    
    // Update GTM
    updateGTMConsent(consentWithNecessary);
  }, [updateGTMConsent]);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: true,
      functional: true,
      advertising: true,
    });
  }, [saveConsent]);

  // Reject all non-essential cookies
  const rejectAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: false,
      functional: false,
      advertising: false,
    });
  }, [saveConsent]);

  // Update specific consent category
  const updateConsent = useCallback((category: keyof ConsentState, value: boolean) => {
    if (category === 'necessary') return; // Can't disable necessary
    
    setConsent(prev => ({
      ...prev,
      [category]: value,
    }));
  }, []);

  // Save current preferences
  const savePreferences = useCallback(() => {
    saveConsent(consent);
  }, [consent, saveConsent]);

  // Open preferences modal
  const openPreferences = useCallback(() => {
    setShowPreferences(true);
  }, []);

  // Close preferences modal
  const closePreferences = useCallback(() => {
    setShowPreferences(false);
  }, []);

  // Reopen banner (for footer link)
  const reopenBanner = useCallback(() => {
    setShowBanner(true);
  }, []);

  return {
    consent,
    hasConsented,
    showBanner,
    showPreferences,
    acceptAll,
    rejectAll,
    updateConsent,
    savePreferences,
    openPreferences,
    closePreferences,
    reopenBanner,
  };
}
