import type { Locale } from "./locales";

/** BCP-47 tags for locale-aware formatting. `gaa` (Ga) has no stable
 * Intl support, so it formats as en-GH — documented, not silent. */
const TAGS: Record<Locale, string> = {
  en: "en-GB",
  tw: "tw-GH",
  ee: "ee-GH",
  gaa: "en-GH",
  sw: "sw-KE",
  ig: "ig-NG",
  ha: "ha-NG",
  yo: "yo-NG",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
  ar: "ar-EG",
  hi: "hi-IN",
  ja: "ja-JP",
  ko: "ko-KR",
  "zh-Hans": "zh-Hans-CN",
  "zh-Hant": "zh-Hant-TW",
};

function tag(locale: Locale): string {
  try {
    return Intl.getCanonicalLocales(TAGS[locale])[0] ?? "en-GB";
  } catch {
    return "en-GB";
  }
}

/** Grouped numbers, e.g. 1,234 / 1.234 / ١٬٢٣٤ per locale. */
export function formatNumber(value: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(tag(locale)).format(value);
  } catch {
    return String(value);
  }
}

/** Localized dates, e.g. 12 Oct 2026 / 12 oct. 2026 / 2026年10月12日. */
export function formatDate(
  value: Date | string | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string {
  try {
    return new Intl.DateTimeFormat(tag(locale), options).format(new Date(value));
  } catch {
    return String(value);
  }
}

/** Localized currency. Currency is always explicit (e.g. "GHS", "USD",
 * "EUR") — never guessed from locale. */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: Locale,
): string {
  try {
    return new Intl.NumberFormat(tag(locale), {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
