import type { StateCreator } from 'zustand';

const CONSENT_STORAGE_KEY = 'cookie-consent';

export interface CookieConsent {
  necessary: boolean;   // Always true
  analytics: boolean;
  advertising: boolean; // Must be true for personalized AdSense
}

export interface ConsentSlice {
  cookieConsent: CookieConsent | null;
  consentBannerVisible: boolean;
  acceptAllCookies: () => void;
  acceptNecessaryOnly: () => void;
  updateCookieConsent: (consent: Partial<CookieConsent>) => void;
  loadSavedConsent: () => void;
}

function saveConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function loadConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);

    // Runtime validation to prevent localStorage injection
    if (
      typeof data !== 'object' ||
      data === null ||
      typeof (data as CookieConsent).necessary !== 'boolean' ||
      typeof (data as CookieConsent).analytics !== 'boolean' ||
      typeof (data as CookieConsent).advertising !== 'boolean'
    ) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }

    return data as CookieConsent;
  } catch {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    return null;
  }
}

export const createConsentSlice: StateCreator<ConsentSlice> = (set) => ({
  cookieConsent: null,
  consentBannerVisible: false,

  loadSavedConsent: () => {
    const saved = loadConsent();
    if (saved) {
      set({ cookieConsent: saved, consentBannerVisible: false });
    } else {
      set({ consentBannerVisible: true });
    }
  },

  acceptAllCookies: () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: true,
      advertising: true,
    };
    saveConsent(consent);
    set({ cookieConsent: consent, consentBannerVisible: false });
  },

  acceptNecessaryOnly: () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: false,
      advertising: false,
    };
    saveConsent(consent);
    set({ cookieConsent: consent, consentBannerVisible: false });
  },

  updateCookieConsent: (partial) => {
    set((state) => {
      const current = state.cookieConsent ?? {
        necessary: true,
        analytics: false,
        advertising: false,
      };
      const updated: CookieConsent = { ...current, ...partial, necessary: true };
      saveConsent(updated);
      return { cookieConsent: updated, consentBannerVisible: false };
    });
  },
});
