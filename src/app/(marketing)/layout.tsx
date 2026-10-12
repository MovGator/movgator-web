import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/components/Marketing";
import { RTL_LOCALES } from "@/lib/i18n/locales";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const rtl = (RTL_LOCALES as readonly string[]).includes(locale);
  return (
    <div lang={locale === "en" ? undefined : locale} dir={rtl ? "rtl" : undefined}>
      <MarketingNav locale={locale} dict={dict} />
      <main id="main" className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:pt-10" data-app-ready>
        {children}
      </main>
      <MarketingFooter dict={dict} />
    </div>
  );
}
