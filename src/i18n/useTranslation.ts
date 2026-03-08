import { useCallback } from 'react';
import { useStore } from '../store/index.ts';
import { t } from './index.ts';

/**
 * React hook that returns a translation function bound to the current language.
 */
export function useTranslation() {
  const language = useStore((s) => s.language);

  const translate = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return t(language, key, params);
    },
    [language]
  );

  return { t: translate, language };
}
