/** Browser/server locale → TMDB region code for watch providers.
 *
 * Prefers the explicit region subtag ("fr-FR" → "FR"); falls back to a
 * small language→region map for bare tags ("de" → "DE"); defaults to US.
 * Output is always validated server-side too (unknown → US).
 */
const LANGUAGE_REGION: Record<string, string> = {
  de: "DE",
  fr: "FR",
  es: "ES",
  it: "IT",
  pt: "BR",
  nl: "NL",
  sv: "SE",
  da: "DK",
  nb: "NO",
  nn: "NO",
  fi: "FI",
  pl: "PL",
  ja: "JP",
  ko: "KR",
  zh: "TW",
  hi: "IN",
  tr: "TR",
  ru: "RU",
};

export function regionFromAcceptLanguage(header: string | null): string {
  const first = (header ?? "").split(",")[0]?.trim() ?? "";
  const [lang, region] = first.split(";")[0]?.split("-") ?? [];
  const code = (region ?? "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code)) return code;
  const mapped = LANGUAGE_REGION[(lang ?? "").trim().toLowerCase()];
  return mapped ?? "US";
}
