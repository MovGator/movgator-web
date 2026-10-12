import { DEFAULT_LOCALE, type Locale } from "./locales";
import { ar } from "./dictionaries/ar";
import { de } from "./dictionaries/de";
import { ee } from "./dictionaries/ee";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { fr } from "./dictionaries/fr";
import { gaa } from "./dictionaries/gaa";
import { ha } from "./dictionaries/ha";
import { hi } from "./dictionaries/hi";
import { ig } from "./dictionaries/ig";
import { ja } from "./dictionaries/ja";
import { ko } from "./dictionaries/ko";
import { pt } from "./dictionaries/pt";
import { sw } from "./dictionaries/sw";
import { tw } from "./dictionaries/tw";
import { yo } from "./dictionaries/yo";
import { zhHans } from "./dictionaries/zh-Hans";
import { zhHant } from "./dictionaries/zh-Hant";

const DICTS: Record<Locale, Record<string, string>> = {
  en,
  tw,
  ee,
  gaa,
  sw,
  ig,
  ha,
  yo,
  fr,
  es,
  de,
  pt,
  ar,
  hi,
  ja,
  ko,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
};

/** Full dictionary for a locale: English underneath, locale overrides on
 * top. Missing keys can never render blank — worst case, English shows. */
export function getDictionary(locale: Locale): Record<string, string> {
  if (locale === DEFAULT_LOCALE) return en;
  return { ...en, ...DICTS[locale] };
}

/** All keys every locale should define (the English set). Used by
 * `npm run i18n:check` to report translation gaps. */
export function allKeys(): string[] {
  return Object.keys(en);
}

/** Look up a key with optional {var} interpolation. */
export function translate(
  dict: Record<string, string>,
  key: string,
  vars?: Record<string, string>,
): string {
  let out = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, v);
    }
  }
  return out;
}
