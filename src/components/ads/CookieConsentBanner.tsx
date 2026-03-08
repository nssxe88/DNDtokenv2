import { useEffect } from 'react';
import { Cookie, Shield } from 'lucide-react';
import { useStore } from '../../store/index.ts';
import { useTranslation } from '../../i18n/useTranslation.ts';

export function CookieConsentBanner() {
  const { t } = useTranslation();
  const visible = useStore((s) => s.consentBannerVisible);
  const loadSavedConsent = useStore((s) => s.loadSavedConsent);
  const acceptAll = useStore((s) => s.acceptAllCookies);
  const acceptNecessary = useStore((s) => s.acceptNecessaryOnly);

  useEffect(() => {
    loadSavedConsent();
  }, [loadSavedConsent]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-700 bg-slate-900/95 px-4 py-4 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:flex-1">
          <Cookie className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-slate-200">{t('consent.title')}</p>
            <p className="mt-1 text-xs text-slate-400">
              {t('consent.message')}
            </p>
          </div>
        </div>

        <div className="flex gap-2 sm:flex-shrink-0">
          <button
            onClick={acceptNecessary}
            className="flex items-center gap-1.5 rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
          >
            <Shield className="h-4 w-4" />
            {t('consent.essentialOnly')}
          </button>
          <button
            onClick={acceptAll}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            {t('consent.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
