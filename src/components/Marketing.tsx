"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Envelope, Globe, UsersThree } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { NewsletterForm } from "./NewsletterForm";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/dictionaries";

type T = Record<string, string>;
const tr = (dict: T, key: string, vars?: Record<string, string>) =>
  translate(dict, key, vars);

const LINKS = [
  { href: "/features", labelKey: "nav.features" },
  { href: "/how-it-works", labelKey: "nav.howItWorks" },
  { href: "/use-cases", labelKey: "nav.useCases" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/faq", labelKey: "nav.faq" },
  { href: "/contact", labelKey: "nav.contact" },
];

export function MarketingNav({ locale, dict }: { locale: Locale; dict: T }) {
  const path = usePathname();
  const router = useRouter();
  const switchLocale = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };
  return (
    <div className="mkt-navwrap">
      <header className="mkt-nav">
        <Link href="/" aria-label={tr(dict, "nav.homeAria")} className="mkt-nav-brand">
          <Logo height={26} />
        </Link>
        <nav aria-label={tr(dict, "nav.mainAria")} className="mkt-nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
            >
              {tr(dict, l.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="mkt-nav-actions ml-auto flex items-center gap-2">
          <LanguageSwitcher
            locale={locale}
            label={tr(dict, "lang.language")}
            onSwitch={switchLocale}
          />
          <ThemeToggle />
          <Link
            href="/get-started"
            className="mr-btn-gold hidden px-4 py-2 text-sm md:inline-block"
          >
            {tr(dict, "nav.getStarted")}
          </Link>
        </div>
      </header>
    </div>
  );
}

export function MarketingFooter({ dict }: { dict: T }) {
  return (
    <footer className="mt-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="cine-panel text-center" style={{ borderRadius: 28 }}>
          <h2 className="font-display mx-auto max-w-xl text-3xl font-extrabold text-[#f7f6f8] md:text-4xl">
            {tr(dict, "footer.ctaTitle")}
          </h2>
          <p className="cine-caption mx-auto mt-2 max-w-md">
            {tr(dict, "footer.ctaSub")}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/home" className="mkt-cta">
              {tr(dict, "footer.enterApp")}
            </Link>
            <Link
              href="/get-started"
              className="inline-flex min-h-[56px] items-center rounded-full border px-6 font-semibold text-[#f7f6f8]"
              style={{ borderColor: "rgb(247 246 248 / 0.35)" }}
            >
              {tr(dict, "footer.guide")}
            </Link>
          </div>
        </div>
      </div>
      <div className="mkt-footer-panel mt-12">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 text-sm sm:grid-cols-2 lg:grid-cols-12">
          <div className="min-w-0 sm:col-span-2 lg:col-span-3">
            <Logo />
            <p className="font-display mt-5 text-xl font-extrabold leading-snug">
              {tr(dict, "footer.tagA")}
              <em className="font-display italic">{tr(dict, "footer.tagB")}</em>
            </p>
            <p className="mt-3 max-w-xs leading-relaxed">
              {tr(dict, "footer.blurb")}
            </p>
            <ul className="mt-6 grid gap-3">
              <li>
                <Link href="/contact" className="mkt-footer-row">
                  <Envelope size={18} weight="regular" aria-hidden="true" />
                  <span>{tr(dict, "footer.contactSupport")}</span>
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="mkt-footer-row">
                  <UsersThree size={18} weight="regular" aria-hidden="true" />
                  <span>{tr(dict, "footer.forFriends")}</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="mkt-footer-row">
                  <Globe size={18} weight="regular" aria-hidden="true" />
                  <span>{tr(dict, "footer.worldwide")}</span>
                </Link>
              </li>
            </ul>
          </div>
          <nav aria-label={tr(dict, "footer.product")} className="lg:col-span-2">
            <h2 className="mkt-footer-h">{tr(dict, "footer.product")}</h2>
            <ul className="mt-4 grid gap-1">
              <li><Link className="mkt-footer-link" href="/features">{tr(dict, "nav.features")}</Link></li>
              <li><Link className="mkt-footer-link" href="/how-it-works">{tr(dict, "nav.howItWorks")}</Link></li>
              <li><Link className="mkt-footer-link" href="/use-cases">{tr(dict, "nav.useCases")}</Link></li>
              <li><Link className="mkt-footer-link" href="/get-started">{tr(dict, "nav.getStarted")}</Link></li>
            </ul>
          </nav>
          <nav aria-label={tr(dict, "footer.company")} className="lg:col-span-2">
            <h2 className="mkt-footer-h">{tr(dict, "footer.company")}</h2>
            <ul className="mt-4 grid gap-1">
              <li><Link className="mkt-footer-link" href="/about">{tr(dict, "nav.about")}</Link></li>
              <li><Link className="mkt-footer-link" href="/faq">{tr(dict, "nav.faq")}</Link></li>
              <li><Link className="mkt-footer-link" href="/contact">{tr(dict, "nav.contact")}</Link></li>
            </ul>
          </nav>
          <nav aria-label={tr(dict, "footer.legal")} className="lg:col-span-2">
            <h2 className="mkt-footer-h">{tr(dict, "footer.legal")}</h2>
            <ul className="mt-4 grid gap-1">
              <li><Link className="mkt-footer-link" href="/privacy">{tr(dict, "footer.privacy")}</Link></li>
              <li><Link className="mkt-footer-link" href="/terms">{tr(dict, "footer.terms")}</Link></li>
            </ul>
          </nav>
          <div className="min-w-0 sm:col-span-2 lg:col-span-3">
            <h2 className="mkt-footer-h">{tr(dict, "footer.newsletter")}</h2>
            <p className="mt-4 leading-relaxed">
              {tr(dict, "footer.nlDesc")}
            </p>
            <div className="mt-4">
              <NewsletterForm variant="footer" showDescription={false} t={dict} />
            </div>
            <p className="mt-3 text-xs leading-relaxed">
              {tr(dict, "footer.nlMicrocopy")}
            </p>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pb-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{tr(dict, "footer.rights")}</p>
          <p>{tr(dict, "footer.tmdbNotice")}</p>
        </div>
      </div>
    </footer>
  );
}
