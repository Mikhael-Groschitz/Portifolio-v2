import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  isLocale,
} from "@/content/locales";

export const LOCALE_STORAGE_KEY = "locale";
export const LOCALE_ATTRIBUTE = "data-locale";
export const FALLBACK_LOCALE: Locale = "en";

function primarySubtag(tag: string): string {
  return tag.split("-")[0].toLowerCase();
}

const LOCALE_SUBTAGS = LOCALES.map(primarySubtag);

export const LOCALE_SCRIPT = `(function(){try{var locales=${JSON.stringify(LOCALES)};var subtags=${JSON.stringify(LOCALE_SUBTAGS)};var locale=null;try{var stored=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});if(locales.indexOf(stored)!==-1){locale=stored}}catch(error){}if(!locale){var preferred=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""];for(var i=0;i<preferred.length&&!locale;i++){var index=subtags.indexOf(String(preferred[i]).split("-")[0].toLowerCase());if(index!==-1){locale=locales[index]}}}locale=locale||${JSON.stringify(FALLBACK_LOCALE)};if(locale!==${JSON.stringify(DEFAULT_LOCALE)}){var root=document.documentElement;root.lang=locale;root.setAttribute(${JSON.stringify(LOCALE_ATTRIBUTE)},locale)}}catch(error){}})()`;

type LocaleRoot = Pick<HTMLElement, "lang" | "getAttribute" | "setAttribute">;

export function detectLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const index = LOCALE_SUBTAGS.indexOf(primarySubtag(tag));
    if (index !== -1) {
      return LOCALES[index];
    }
  }
  return FALLBACK_LOCALE;
}

export function resolveInitialLocale(
  stored: string | null,
  preferred: readonly string[],
): Locale {
  return isLocale(stored) ? stored : detectLocale(preferred);
}

export function applyLocale(
  locale: Locale,
  root: LocaleRoot = document.documentElement,
): void {
  root.lang = locale;
  root.setAttribute(LOCALE_ATTRIBUTE, locale);
}

export function readAppliedLocale(
  root: LocaleRoot = document.documentElement,
): Locale {
  const applied = root.getAttribute(LOCALE_ATTRIBUTE);
  return isLocale(applied) ? applied : DEFAULT_LOCALE;
}

export function subscribeToLocale(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [LOCALE_ATTRIBUTE],
  });
  return () => observer.disconnect();
}

export function readStoredLocale(
  storage?: Pick<Storage, "getItem">,
): Locale | null {
  try {
    const stored = (storage ?? window.localStorage).getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function storeLocale(
  locale: Locale,
  storage?: Pick<Storage, "setItem">,
): boolean {
  try {
    (storage ?? window.localStorage).setItem(LOCALE_STORAGE_KEY, locale);
    return true;
  } catch {
    return false;
  }
}

export function nextLocale(current: Locale): Locale {
  return LOCALES[(LOCALES.indexOf(current) + 1) % LOCALES.length];
}
