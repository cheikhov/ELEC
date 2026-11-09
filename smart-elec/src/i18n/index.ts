/**
 * SMART ELEC — Type-safe, Responsive i18n Architecture
 * Supports French (primary) and Arabic (RTL, authentic technical terminology).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import fr from './locales/fr';
import ar from './locales/ar';

export type SupportedLanguage = 'fr' | 'ar';

export const translations = {
  fr,
  ar,
};

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key: string) => key,
  isRTL: false,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('smart-elec-lang');
    if (saved === 'ar' || saved === 'fr') return saved;
    return 'fr';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('smart-elec-lang', language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [language, isRTL]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let current: any = translations[language];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to French
        let fallback: any = translations.fr;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            fallback = key;
            break;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') return key;

    if (params) {
      return Object.entries(params).reduce((str, [pKey, pVal]) => {
        return str.replace(new RegExp(`{{${pKey}}}`, 'g'), String(pVal));
      }, current);
    }

    return current;
  }, [language]);

  return React.createElement(
    I18nContext.Provider,
    { value: { language, setLanguage, t, isRTL } },
    children
  );
};

export function useI18n() {
  return useContext(I18nContext);
}

