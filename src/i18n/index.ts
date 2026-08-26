import en from '@/i18n/locales/en.json' with { type: 'json' };
import es from '@/i18n/locales/es.json' with { type: 'json' };
import pt from '@/i18n/locales/pt.json' with { type: 'json' };

export type Locale = 'es' | 'en' | 'pt';

export type ThemeMode = 'light' | 'dark';

const dictionaries: Record<Locale, Record<string, string>> = {
  es,
  en,
  pt,
};

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = dictionaries[locale] ?? dictionaries.es;
  let value = dict[key] ?? dictionaries.en[key] ?? key;

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replaceAll(`{${paramKey}}`, String(paramValue));
    }
  }

  return value;
}

export function resolveValidationMessage(
  locale: Locale,
  raw: string,
): string {
  if (raw.includes(':')) {
    const [key, label] = raw.split(':');
    return translate(locale, key, { label });
  }
  return translate(locale, raw);
}
