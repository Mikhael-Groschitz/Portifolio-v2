import type { Locale } from "./locales";
import type { CountText, YearMonth } from "./types";

export function formatYearMonth(value: YearMonth, locale: Locale): string {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(year, month - 1));
}

export function formatCount(text: CountText, count: number): string {
  const template = count === 1 ? text.one : text.other;
  return template.replace("{count}", String(count));
}
