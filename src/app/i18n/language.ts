export type AppLanguage = 'ro' | 'ru' | 'en';

export const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ['ro', 'ru', 'en'];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  ro: 'RO',
  ru: 'RU',
  en: 'EN',
};

const STORAGE_KEY = 'instrumental-separator:lang';

export function detectInitialLanguage(): AppLanguage {
  // Pe server (SSR/prerender) nu există window/localStorage — randăm mereu
  // varianta română, limba canonică a paginii prerandate.
  if (typeof window === 'undefined') return 'ro';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // localStorage poate fi indisponibil (mod privat etc.)
  }

  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  if (isSupportedLanguage(browserLang)) return browserLang;

  return 'ro';
}

export function persistLanguage(lang: AppLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage poate fi indisponibil (mod privat etc.)
  }
}

function isSupportedLanguage(value: string | null | undefined): value is AppLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
