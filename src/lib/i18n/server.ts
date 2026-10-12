import { cookies, headers } from "next/headers";
import { localeFromHeader, parseLocale, LOCALE_COOKIE, type Locale } from "./locales";

/** Server-side locale: cookie wins, then Accept-Language, then English.
 * Reading this makes a route dynamic — used only in the marketing layout
 * and marketing pages, never in the root layout (the app shell stays put).
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const saved = parseLocale(store.get(LOCALE_COOKIE)?.value);
  if (saved) return saved;
  const h = await headers();
  return localeFromHeader(h.get("accept-language"));
}
