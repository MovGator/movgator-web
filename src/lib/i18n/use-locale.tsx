"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  localeFromHeader,
  parseLocale,
  LOCALE_COOKIE,
  type Locale,
} from "./locales";
import { getDictionary, translate } from "./dictionaries";

/** Client-side locale: cookie first (matches what the server rendered),
 * then the browser language, then English. Used only by client islands
 * (auth forms, dialogs); marketing chrome gets strings as server props,
 * which can never mismatch during hydration. */
function initialLocale(): Locale {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/mr-locale=([A-Za-z]{2,3}(?:-[A-Za-z]{4})?)/);
    const parsed = parseLocale(m?.[1]);
    if (parsed) return parsed;
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    return localeFromHeader(navigator.language);
  }
  return DEFAULT_LOCALE;
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      setLocaleState(next);
      router.refresh();
    },
    [router],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string>) =>
      translate(getDictionary(locale), key, vars),
    [locale],
  );

  return { locale, t, setLocale };
}
