import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localeFromHeader, LOCALE_COOKIE } from "@/lib/i18n/locales";

/** Ensure every page response carries the resolved locale cookie, so
 * server rendering (cookie/header) and client islands (cookie/navigator)
 * always agree — no hydration mismatch, no language flash. */
export function middleware(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return NextResponse.next();
  const locale = localeFromHeader(request.headers.get("accept-language"));
  const res = NextResponse.next();
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|brand|manifest.webmanifest|sw.js|sitemap.*|robots.txt).*)",
  ],
};
