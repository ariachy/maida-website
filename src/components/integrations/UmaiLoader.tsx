'use client';

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';

const UMAI_API_KEY = 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c';

interface UmaiLoaderProps {
  children?: React.ReactNode;
}

export default function UmaiLoader({ children }: UmaiLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger loading on any user interaction
  const triggerLoad = useCallback(() => {
    if (!shouldLoad) {
      setShouldLoad(true);
    }
  }, [shouldLoad]);

  useEffect(() => {
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
  }, [triggerLoad]);

  const handleScriptLoad = () => {
    setIsLoaded(true);
  };

  return (
    <>
      {shouldLoad && (
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
 * Hook to open UMAI widget from any component
 * Handles the case where UMAI might not be loaded yet
 */
export function useUmaiWidget() {
  const [isOpening, setIsOpening] = useState(false);

  const openWidget = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: UMAI_API_KEY,
        widgetType: 'reservation',
      });
      (window as any).umaiWidget.openWidget();
    } else {
      // UMAI not loaded yet - wait and retry
      setIsOpening(true);
      const checkInterval = setInterval(() => {
        if ((window as any).umaiWidget) {
          clearInterval(checkInterval);
          setIsOpening(false);
          (window as any).umaiWidget.config({
            apiKey: UMAI_API_KEY,
            widgetType: 'reservation',
          });
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
