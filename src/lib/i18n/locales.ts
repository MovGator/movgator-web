/** Supported site locales. English is complete and is the fallback
 * for any key missing in another language (dictionaries merge over it).
 *
 * Ghanaian languages (Twi `tw`, Ewe `ee`, Ga `gaa`) and Swahili (`sw`)
 * sit alongside global locales. `ga` is deliberately NOT used — it is
 * Irish. `ak` (Akan) resolves to `tw` (Twi) — mutually intelligible,
 * labelled as Twi until a dedicated Akan dictionary exists.
 */
export const LOCALES = [
  "en",
  "tw",
  "ee",
  "gaa",
  "sw",
  "ig",
  "ha",
  "yo",
  "fr",
  "es",
  "de",
  "pt",
  "ar",
  "hi",
  "ja",
  "ko",
  "zh-Hans",
  "zh-Hant",
] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "mr-locale";

/** Right-to-left locales — layout sets dir="rtl" for these. */
export const RTL_LOCALES: readonly Locale[] = ["ar"];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  tw: "Twi",
  ee: "Eʋegbe",
  gaa: "Gã",
  sw: "Kiswahili",
  ig: "Igbo",
  ha: "Hausa",
  yo: "Yorùbá",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
  ar: "العربية",
  hi: "हिन्दी",
  ja: "日本語",
  ko: "한국어",
  "zh-Hans": "中文简体",
  "zh-Hant": "中文繁體",
};

/** Canonical locale for an arbitrary value (cookie, navigator), or null.
 * Case-insensitive; `ak` (Akan) maps to `tw` (Twi). */
export function parseLocale(value: string | null | undefined): Locale | null {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v === "ak") return "tw";
  for (const loc of LOCALES) {
    if (v === loc.toLowerCase()) return loc;
  }
  return null;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return parseLocale(value) !== null;
}

/** Resolve a locale from an Accept-Language header value. Script-aware
 * Chinese handling: Hant/TW/HK/MO → Traditional, everything else
 * Chinese (incl. bare `zh`) → Simplified. */
export function localeFromHeader(header: string | null): Locale {
  const first = (header ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  const tag = first.split(";")[0]?.trim() ?? "";
  if (!tag) return DEFAULT_LOCALE;
  if (tag === "ak") return "tw";
  if (tag.startsWith("zh")) {
    if (
      tag.includes("hant") ||
      tag.endsWith("-tw") ||
      tag.endsWith("-hk") ||
      tag.endsWith("-mo")
    ) {
      return "zh-Hant";
    }
    return "zh-Hans";
  }
  for (const loc of LOCALES) {
    const l = loc.toLowerCase();
    if (tag === l || tag.startsWith(`${l}-`)) return loc;
  }
  const bare = tag.split("-")[0] ?? "";
  return parseLocale(bare) ?? DEFAULT_LOCALE;
}
