import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
export const locales = ["en", "es", "de", "fr"] as const;
export type Locale = (typeof locales)[number];
export type Messages = typeof en;
export const dictionaries: Record<Locale, Messages> = { en, es, de, fr };
export const regions: Record<Locale, string> = {
  en: "en-CH",
  es: "es-ES",
  de: "de-CH",
  fr: "fr-CH",
};
export function isLocale(value: unknown): value is Locale {
  return locales.some((locale) => locale === value);
}
export function formatNumber(
  value: number | null | undefined,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
) {
  return value == null || !Number.isFinite(value)
    ? dictionaries[locale].unavailable
    : new Intl.NumberFormat(regions[locale], options).format(value);
}
