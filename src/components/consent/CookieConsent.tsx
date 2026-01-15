'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsent } from '@/hooks/useConsent';
import { consentTranslations, ConsentLocale } from '@/lib/consent-translations';

interface CookieConsentProps {
  locale?: string;
}

export default function CookieConsent({ locale = 'en' }: CookieConsentProps) {
  const {
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
  } = useConsent();

  // Get translations for current locale
  const lang = (locale in consentTranslations ? locale : 'en') as ConsentLocale;
  const t = consentTranslations[lang];

  // Don't render anything until we know consent status
  if (hasConsented === null) return null;

  return (
    <>
      {/* Main Banner */}
      <AnimatePresence>
        {showBanner && !showPreferences && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
          >
            <div className="max-w-3xl mx-auto bg-warm-white border border-sand rounded-2xl shadow-xl overflow-hidden">
              <div className="p-5 md:p-6">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg md:text-xl font-display font-medium text-charcoal mb-2">
                    {t.title}
                  </h3>
                  <p className="text-sm md:text-base text-stone leading-relaxed">
                    {t.description}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5">
                  <button
                    onClick={rejectAll}
                    className="px-5 py-2.5 text-sm font-medium text-charcoal hover:text-charcoal/70 transition-colors order-3 sm:order-1"
                  >
                    {t.rejectAll}
                  </button>
                  <button
                    onClick={openPreferences}
                    className="px-5 py-2.5 text-sm font-medium text-charcoal border border-charcoal/20 hover:border-charcoal/40 hover:bg-sand/30 rounded-lg transition-all order-2"
                  >
                    {t.managePreferences}
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2.5 text-sm font-medium bg-terracotta hover:bg-terracotta/90 text-warm-white rounded-lg transition-colors sm:ml-auto order-1 sm:order-3"
                  >
                    {t.acceptAll}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <>
            {/* Backdrop + Modal Container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
                onClick={closePreferences}
              />

              {/* Modal */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-lg max-h-[85vh]"
              >
                <div className="bg-warm-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-sand">
                {/* Header */}
                <div className="p-5 md:p-6 border-b border-sand/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-medium text-charcoal">
                      {t.managePreferences}
                    </h3>
                    <button
                      onClick={closePreferences}
                      className="p-2 hover:bg-sand/50 rounded-lg transition-colors"
                      aria-label={t.close}
                    >
                      <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div className="p-5 md:p-6 overflow-y-auto flex-1">
                  <div className="space-y-4">
                    {/* Necessary - Always On */}
                    <div className="p-4 bg-sage/10 rounded-xl border border-sage/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-charcoal">
                          {t.categories.necessary.title}
                        </h4>
                        <span className="text-xs text-sage bg-sage/20 px-2.5 py-1 rounded-full font-medium">
                          Always on
                        </span>
                      </div>
                      <p className="text-sm text-stone leading-relaxed">
                        {t.categories.necessary.description}
                      </p>
                    </div>

                    {/* Analytics */}
                    <div className="p-4 bg-sand/20 rounded-xl border border-sand/40">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-charcoal">
                          {t.categories.analytics.title}
                        </h4>
                        <Toggle
                          checked={consent.analytics}
                          onChange={(checked) => updateConsent('analytics', checked)}
                        />
                      </div>
                      <p className="text-sm text-stone leading-relaxed">
                        {t.categories.analytics.description}
                      </p>
                    </div>

                    {/* Functional */}
                    <div className="p-4 bg-sand/20 rounded-xl border border-sand/40">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-charcoal">
                          {t.categories.functional.title}
                        </h4>
                        <Toggle
                          checked={consent.functional}
                          onChange={(checked) => updateConsent('functional', checked)}
                        />
                      </div>
                      <p className="text-sm text-stone leading-relaxed">
                        {t.categories.functional.description}
                      </p>
                    </div>

                    {/* Advertising */}
                    <div className="p-4 bg-sand/20 rounded-xl border border-sand/40">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-charcoal">
                          {t.categories.advertising.title}
                        </h4>
                        <Toggle
                          checked={consent.advertising}
                          onChange={(checked) => updateConsent('advertising', checked)}
                        />
                      </div>
                      <p className="text-sm text-stone leading-relaxed">
                        {t.categories.advertising.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 md:p-6 border-t border-sand/60 bg-sand/10">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={rejectAll}
                      className="px-5 py-2.5 text-sm font-medium text-charcoal hover:text-charcoal/70 transition-colors"
                    >
                      {t.rejectAll}
                    </button>
                    <button
                      onClick={savePreferences}
                      className="px-6 py-2.5 text-sm font-medium bg-charcoal hover:bg-charcoal/90 text-warm-white rounded-lg transition-colors sm:ml-auto"
                    >
                      {t.savePreferences}
                    </button>
                  </div>
                </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Toggle Switch Component
function Toggle({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-terracotta' : 'bg-stone/30'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-warm-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// Export a small button to reopen consent preferences (for footer)
export function CookieSettingsButton({ 
  locale = 'en',
  className = '' 
}: { 
  locale?: string;
  className?: string;
}) {
  const { reopenBanner } = useConsent();
  const lang = (locale in consentTranslations ? locale : 'en') as ConsentLocale;
  
  return (
    <button
      onClick={reopenBanner}
      className={`text-sm text-stone hover:text-warm-white transition-colors ${className}`}
    >
      Cookie Settings
    </button>
  );
}
