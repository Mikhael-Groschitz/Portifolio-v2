export const LOCALES = ["pt-BR", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export type Localized<T = string> = Record<Locale, T>;

export const DEFAULT_LOCALE: Locale = "pt-BR";

export function byLocale<T>(pick: (locale: Locale) => T): Localized<T> {
  return { "pt-BR": pick("pt-BR"), en: pick("en") };
}

export function mapLocalized<T, U>(
  value: Localized<T>,
  pick: (entry: T) => U,
): Localized<U> {
  return byLocale((locale) => pick(value[locale]));
}

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}
