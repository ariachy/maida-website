'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function TrackingScripts() {
  const pathname = usePathname();
  
  // Don't load tracking on review page
  if (pathname?.startsWith('/review')) {
    return null;
  }

  return (
    <>
      {/* GTM Consent Mode - MUST load BEFORE GTM */}
      <Script id="gtm-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){dataLayer.push(arguments);}

          // Set default consent to denied
          window.gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'functionality_storage': 'denied',
            'personalization_storage': 'denied',
            'security_storage': 'granted',
            'wait_for_update': 500
          });

          // Enable URL passthrough for better analytics
          window.gtag('set', 'url_passthrough', true);

          // Enable ads data redaction when consent denied
          window.gtag('set', 'ads_data_redaction', true);
        `}
      </Script>

      {/* Google Tag Manager */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-MZ83M6VJ');
        `}
      </Script>

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-MZ83M6VJ"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
