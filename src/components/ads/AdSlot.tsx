import { useEffect, useRef } from 'react';
import { useStore } from '../../store/index.ts';
import { AD_CONFIG } from './adConfig.ts';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

interface AdSlotProps {
  slotId?: string;
  format?: 'display' | 'in-feed' | 'in-article' | 'auto';
  layout?: 'fixed' | 'responsive';
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export function AdSlot({
  slotId,
  format = 'display',
  layout = 'responsive',
  width,
  height,
  className = '',
  fallback,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const cookieConsent = useStore((s) => s.cookieConsent);

  const isEnabled = AD_CONFIG.enabled && AD_CONFIG.clientId && slotId;

  useEffect(() => {
    // Don't load ads until consent is given (GDPR)
    if (!isEnabled || pushed.current || !cookieConsent) return;

    // Wait a tick to ensure the DOM element is mounted
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // AdSense script not loaded or blocked — silently ignore
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isEnabled, cookieConsent]);

  if (!isEnabled) {
    return fallback ? <>{fallback}</> : null;
  }

  // Non-personalized ads if advertising cookies not consented
  const nonPersonalized = !cookieConsent?.advertising;

  const style: React.CSSProperties =
    layout === 'fixed' && width && height
      ? { display: 'inline-block', width, height }
      : { display: 'block' };

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={AD_CONFIG.clientId}
        data-ad-slot={slotId}
        data-ad-format={layout === 'responsive' ? 'auto' : format}
        data-full-width-responsive={layout === 'responsive' ? 'true' : undefined}
        data-adtest={import.meta.env.DEV ? 'on' : undefined}
        {...(nonPersonalized ? { 'data-npa': '1' } : {})}
      />
    </div>
  );
}
