import en from './en.json';
import hu from './hu.json';

export type Language = 'en' | 'hu';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

const translations: Record<Language, TranslationObject> = { en, hu };

/**
 * Get a nested value from a translation object using a dot-separated key.
 * Supports interpolation with {param} syntax.
 */
export function t(lang: Language, key: string, params?: Record<string, string | number>): string {
  const parts = key.split('.');
  let current: unknown = translations[lang];

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      // Fallback to English if key not found in current language
      current = undefined;
      break;
    }
  }

  // Fallback to English
  if (current === undefined && lang !== 'en') {
    return t('en', key, params);
  }

  if (typeof current !== 'string') {
    return key; // Return the key itself as last resort
  }

  // Interpolate params
  if (params) {
    return current.replace(/\{(\w+)\}/g, (_, paramName: string) =>
      params[paramName] !== undefined ? String(params[paramName]) : `{${paramName}}`
    );
  }

  return current;
}

/**
 * Detect the best language based on browser settings.
 */
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en';
  if (browserLang.startsWith('hu')) {
    return 'hu';
  }
  return 'en';
}
