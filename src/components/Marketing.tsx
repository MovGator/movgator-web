"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, List, X } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { NewsletterForm } from "./NewsletterForm";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function MarketingNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="mkt-navwrap">
      <header className="mkt-nav">
        <Link href="/" aria-label="MovGator home">
          <Logo height={26} />
        </Link>
        <nav aria-label="Marketing" className="mkt-nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/get-started"
            className="mr-btn-gold hidden px-4 py-2 text-sm sm:inline-block"
          >
            Get started
          </Link>
          <button
            type="button"
            className="mr-chip inline-flex items-center justify-center p-2 lg:hidden"
            aria-expanded={open}
            aria-controls="marketing-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <X size={20} weight="regular" aria-hidden="true" />
            ) : (
              <List size={20} weight="regular" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>
      {open && (
        <nav id="marketing-menu" aria-label="Marketing sections" className="mkt-menu-panel lg:hidden">
          <ul className="grid gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={path === l.href ? "page" : undefined}
                  className="block rounded-2xl px-4 py-3 text-base font-medium"
                  style={path === l.href ? { background: "var(--mr-surface-2)", fontWeight: 700 } : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/get-started"
                onClick={() => setOpen(false)}
                className="mr-btn-gold mt-2 flex items-center justify-center gap-2 px-4 py-3 text-base"
              >
                Get started — free to browse
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-16 px-4">
      <div className="cine-panel mx-auto max-w-6xl text-center" style={{ borderRadius: 28 }}>
        <h2 className="font-display mx-auto max-w-xl text-3xl font-extrabold text-[#f7f6f8] md:text-4xl">
          Your next favourite film is one roll away.
        </h2>
        <p className="cine-caption mx-auto mt-2 max-w-md">
          Browse free, roll the dice, and vote with friends — no account needed to start.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/home" className="mkt-cta">
            Enter the app
          </Link>
          <Link
            href="/get-started"
            className="inline-flex min-h-[56px] items-center rounded-full border px-6 font-semibold text-[#f7f6f8]"
            style={{ borderColor: "rgb(247 246 248 / 0.35)" }}
          >
            Get started guide
          </Link>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 py-12 text-sm sm:grid-cols-2 lg:grid-cols-12">
        <div className="min-w-0 sm:col-span-2 lg:col-span-6">
          <Logo />
          <p className="mt-3 max-w-xs" style={{ color: "var(--mr-ink-soft)" }}>
            Find what to watch tonight — films and anime, decided alone or together.
          </p>
          <div className="mt-4">
            <NewsletterForm variant="card" showDescription />
          </div>
        </div>
        <nav aria-label="Product" className="lg:col-span-2">
          <h2 className="font-display text-base font-bold">Product</h2>
          <ul className="mt-2 grid gap-1" style={{ color: "var(--mr-ink-soft)" }}>
            <li><Link className="inline-block rounded py-1 underline" href="/features">Features</Link></li>
            <li><Link className="inline-block rounded py-1 underline" href="/how-it-works">How it works</Link></li>
            <li><Link className="inline-block rounded py-1 underline" href="/use-cases">Use cases</Link></li>
            <li><Link className="inline-block rounded py-1 underline" href="/get-started">Get started</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company" className="lg:col-span-2">
          <h2 className="font-display text-base font-bold">Company</h2>
          <ul className="mt-2 grid gap-1" style={{ color: "var(--mr-ink-soft)" }}>
            <li><Link className="inline-block rounded py-1 underline" href="/about">About</Link></li>
            <li><Link className="inline-block rounded py-1 underline" href="/faq">FAQ</Link></li>
            <li><Link className="inline-block rounded py-1 underline" href="/contact">Contact</Link></li>
          </ul>
        </nav>
        <nav aria-label="Legal" className="lg:col-span-2">
          <h2 className="font-display text-base font-bold">Legal</h2>
          <ul className="mt-2 grid gap-1" style={{ color: "var(--mr-ink-soft)" }}>
            <li><Link className="inline-block rounded py-1 underline" href="/privacy">Privacy</Link></li>
            <li><Link className="inline-block rounded py-1 underline" href="/terms">Terms</Link></li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl pb-8 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}
