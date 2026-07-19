'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const UMAI_API_KEY = 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c';

interface UmaiLoaderProps {
  children?: React.ReactNode;
}

export default function UmaiLoader({ children }: UmaiLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();

  // Don't load UMAI on admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  // Trigger loading on any user interaction
  const triggerLoad = useCallback(() => {
    if (!shouldLoad) {
      setShouldLoad(true);
    }
  }, [shouldLoad]);

  // Reservation landing page (/en/reserve, /pt/reserve): load UMAI
  // immediately — ad visitors expect the widget to be ready instantly.
  const isReservePage = pathname?.includes('/reserve');

  useEffect(() => {
    // Don't set up listeners on admin pages
    if (isAdminPage) return;

    // Eager load on the reserve landing page, skip lazy listeners
    if (isReservePage) {
      triggerLoad();
      return;
    }

    // Events that trigger UMAI loading
    const events = [
      'scroll',
      'mousemove',
      'touchstart',
      'keydown',
      'click',
    ];

    // Add listeners
    events.forEach((event) => {
      window.addEventListener(event, triggerLoad, { once: true, passive: true });
    });

    // Also load after a delay as fallback (e.g., user just stares at page)
    const timeout = setTimeout(() => {
      triggerLoad();
    }, 5000); // 5 seconds fallback

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, triggerLoad);
      });
      clearTimeout(timeout);
    };
  }, [triggerLoad, isAdminPage, isReservePage]);

  const handleScriptLoad = () => {
    setIsLoaded(true);
  };

  return (
    <>
      {shouldLoad && !isAdminPage && (
        <Script
          src="https://widget.letsumai.com/dist/embed.min.js"
          data-api-key={UMAI_API_KEY}
          data-widget-type="reservation"
          strategy="afterInteractive"
          onLoad={handleScriptLoad}
        />
      )}
      {children}
    </>
  );
}

/**
 * Derive the site locale from the URL ('/pt/...' → 'pt', default 'en').
 */
function currentUmaiLocale(): string {
  if (typeof window === 'undefined') return 'en';
  return window.location.pathname.split('/')[1] === 'pt' ? 'pt' : 'en';
}

/**
 * Shared UMAI widget config with language hints so the widget opens in
 * the same language as the page. UMAI supports Portuguese; the embed's
 * exact key name isn't publicly documented, so we pass the common
 * variants — unknown keys are simply ignored.
 */
function buildUmaiConfig(widgetType: 'reservation' | 'giftcard') {
  const lang = currentUmaiLocale();
  return {
    apiKey: UMAI_API_KEY,
    widgetType,
    language: lang,
    locale: lang,
    lang,
  };
}

/**
 * Hook to open UMAI widget from any component
 * Handles the case where UMAI might not be loaded yet
 */
export function useUmaiWidget() {
  const [isOpening, setIsOpening] = useState(false);

  const openWidget = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config(buildUmaiConfig('reservation'));
      (window as any).umaiWidget.openWidget();
    } else {
      // UMAI not loaded yet - wait and retry
      setIsOpening(true);
      const checkInterval = setInterval(() => {
        if ((window as any).umaiWidget) {
          clearInterval(checkInterval);
          setIsOpening(false);
          (window as any).umaiWidget.config(buildUmaiConfig('reservation'));
          (window as any).umaiWidget.openWidget();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        setIsOpening(false);
      }, 5000);
    }
  }, []);

  return { openWidget, isOpening };
}

/**
 * Hook to open UMAI gift card widget from any component
 */
export function useUmaiGiftCard() {
  const [isOpening, setIsOpening] = useState(false);

  const openGiftCard = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config(buildUmaiConfig('giftcard'));
      (window as any).umaiWidget.openWidget();
    } else {
      // UMAI not loaded yet - wait and retry
      setIsOpening(true);
      const checkInterval = setInterval(() => {
        if ((window as any).umaiWidget) {
          clearInterval(checkInterval);
          setIsOpening(false);
          (window as any).umaiWidget.config(buildUmaiConfig('giftcard'));
          (window as any).umaiWidget.openWidget();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        setIsOpening(false);
      }, 5000);
    }
  }, []);

  return { openGiftCard, isOpening };
}
