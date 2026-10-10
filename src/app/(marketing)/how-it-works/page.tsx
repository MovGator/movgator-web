import Link from "next/link";
import { Button } from "@/components/Button";

const STEPS = [
  {
    n: "1",
    title: "Browse free — no account",
    body: "Open the app and scroll the feed, search films and anime, open any title, and roll the dice. Nothing interrupts you with sign-in walls; the catalogue is public.",
    cta: { href: "/home", label: "Open the app" },
  },
  {
    n: "2",
    title: "Decide alone or together",
    body: "Stuck? Roll the Dice with your filters. With friends? Create a Movie Night, share the invite link, add candidates and vote live until a winner takes the evening.",
    cta: { href: "/dice", label: "Roll the Dice" },
  },
  {
    n: "3",
    title: "Sign in to keep it",
    body: "The moment you save a watchlist item, rate a title, or finish onboarding, we'll ask you to sign in — and return you to exactly what you were doing. Your lists, taste and nights then sync everywhere, including the installed app.",
    cta: { href: "/profile", label: "Create your account" },
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
        How it works
      </p>
      <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold md:text-5xl">
        From &ldquo;what should we watch?&rdquo; to pressing play.
      </h1>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <section key={s.n} className="mr-card flex flex-col p-6">
            <span className="font-display text-4xl font-extrabold" style={{ color: "var(--mr-gold)" }} aria-hidden="true">
              {s.n}
            </span>
            <h2 className="font-display mt-2 text-xl font-bold">{s.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
              {s.body}
            </p>
            <Link href={s.cta.href} className="mt-4 text-sm font-semibold underline">
              {s.cta.label}
            </Link>
          </section>
        ))}
      </div>
      <section className="mr-card mt-8 p-6 md:p-8" aria-labelledby="install">
        <h2 id="install" className="font-display text-xl font-bold">Take it with you</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          MovGator installs as an app on your phone, tablet or desktop — offline fallback
          included. Open the app once, and it offers installation itself; nothing to download
          from a store.
        </p>
        <div className="mt-4">
          <Link href="/get-started">
            <Button variant="primary">See install steps</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: "How it works",
  description: "Browse free, decide with Dice or Movie Night, sign in to keep your taste. Plus how to install the MovGator app.",
};
