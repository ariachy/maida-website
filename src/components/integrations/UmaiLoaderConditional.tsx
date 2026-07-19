'use client';

import { usePathname } from 'next/navigation';
import UmaiLoader from './UmaiLoader';

/**
 * Loads UMAI site-wide so every "Reserve" CTA can open the booking widget.
 *
 * UMAI's floating launcher button is suppressed by a beforeInteractive guard
 * in the root layout (app/layout.tsx) that pre-registers the <floating-button>
 * custom element as a no-op, so it never renders. Nothing to do here beyond
 * loading the widget for the CTAs.
 *
 * MIGRATION NOTE: when moving off UMAI (see lib/booking.ts), remove the guard
 * in app/layout.tsx and this loader.
 */
export default function UmaiLoaderConditional() {
  const pathname = usePathname();

  if (pathname?.startsWith('/review')) {
    return null;
  }

  return <UmaiLoader />;
}
