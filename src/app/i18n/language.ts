export type AppLanguage = 'ro' | 'ru' | 'en';

export const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ['ro', 'ru', 'en'];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  ro: 'RO',
  ru: 'RU',
  en: 'EN',
};

const STORAGE_KEY = 'instrumental-separator:lang';

export function detectInitialLanguage(): AppLanguage {
  // On the server (SSR/prerender) window/localStorage don't exist — always render
  // the Romanian variant, the canonical language of the prerendered page.
  if (typeof window === 'undefined') return 'ro';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // localStorage may be unavailable (private mode, etc.)
  }

  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  if (isSupportedLanguage(browserLang)) return browserLang;

  return 'ro';
}

export function persistLanguage(lang: AppLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage may be unavailable (private mode, etc.)
  }
}

function isSupportedLanguage(value: string | null | undefined): value is AppLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
