"use client";
import { Globe } from "@phosphor-icons/react";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/locales";

/** Compact language picker for the marketing nav. The current locale
 * arrives as a server-resolved prop (always hydration-safe); switching
 * writes the cookie and refreshes server-rendered content. */
export function LanguageSwitcher({
  locale,
  label,
  onSwitch,
}: {
  locale: Locale;
  label: string;
  onSwitch: (next: Locale) => void;
}) {
  return (
    <label className="mr-chip inline-flex items-center gap-2 px-3 py-2 text-sm">
      <Globe size={16} weight="regular" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={locale}
        onChange={(e) => {
          const next = e.target.value;
          if ((LOCALES as readonly string[]).includes(next)) {
            onSwitch(next as Locale);
          }
        }}
        className="cursor-pointer bg-transparent font-semibold"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
