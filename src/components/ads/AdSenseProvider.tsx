import { useEffect } from 'react';
import { AD_CONFIG } from './adConfig.ts';
import { useStore } from '../../store/index.ts';

/**
 * Loads the Google AdSense script tag asynchronously.
 * Should be mounted once at the app root level.
 * Does nothing if VITE_ADSENSE_ENABLED is not 'true'.
 * GDPR: Only loads the script AFTER cookie consent is given.
 */
export function AdSenseProvider({ children }: { children: React.ReactNode }) {
  const cookieConsent = useStore((s) => s.cookieConsent);

  useEffect(() => {
    if (!AD_CONFIG.enabled || !AD_CONFIG.clientId) return;

    // GDPR: Do not load AdSense script until user has given consent
    if (!cookieConsent) return;

    // Check if script is already loaded
    const existing = document.querySelector(
      'script[src*="pagead2.googlesyndication.com"]'
    );
    if (existing) return;

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';

    // Non-blocking: if it fails, the app still works
    script.onerror = () => {
      if (import.meta.env.DEV) {
        console.warn('[AdSense] Script failed to load — ads will not be displayed');
      }
    };

    document.head.appendChild(script);
  }, [cookieConsent]);

  return <>{children}</>;
}
