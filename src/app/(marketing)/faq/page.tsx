import Link from "next/link";

const FAQS = [
  {
    q: "Do I need an account?",
    a: "No. The feed, search, title pages, basic Dice rolls, onboarding preview and joining a Movie Night as a guest are all public. An account is needed only to save a watchlist, rate, keep your taste, or host nights — and we'll return you to what you were doing after sign-in.",
  },
  {
    q: "Is MovGator free?",
    a: "Browsing is free. Accounts are free. The demo catalogue runs without any paid dependency; live TMDB metadata uses TMDB's free non-commercial tier with attribution.",
  },
  {
    q: "Is Roll the Dice really random?",
    a: "Yes — uniformly at random from titles matching your filters, using a bounded database pick. The candidate count is shown with every roll. There is no AI ranking disguised as a dice.",
  },
  {
    q: "How do Movie Night invites work?",
    a: "The host shares an invite link. Guests join with a display name — no account required. Links expire after 7 days, and guessing a session ID alone grants nothing: every action checks membership on the server.",
  },
  {
    q: "Where do ratings and artwork come from?",
    a: "Live metadata and artwork come from TMDB when configured, with source-labelled scores. Until then the app runs on a clearly labelled demo catalogue with original summaries and no third-party ratings. We never invent cast, provider or availability data.",
  },
  {
    q: "Does MovGator support anime?",
    a: "Fully — dedicated category, filters, onboarding picks, dice toggle and feed presence, with media-type modelling that keeps anime distinct from generic animation.",
  },
  {
    q: "Does it work offline?",
    a: "The installed app caches its shell and static assets with an offline fallback page. Catalogue data and live votes need a connection; Movie Night shows reconnect states and resyncs automatically.",
  },
  {
    q: "How do I delete my account and data?",
    a: "Profile → Delete account removes your profile, watchlist, ratings, votes and nights immediately. Logs keep request IDs up to 30 days; invite tokens expire after 7 days.",
  },
  {
    q: "How is my taste used?",
    a: "Genre picks and swipe signals seed simple, documented recommendation rules — matching genres boosted by popularity. Five swipes are a starting hint, and we never claim they build a complete taste profile.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
        FAQ
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold md:text-5xl">
        Questions, answered plainly.
      </h1>
      <div className="mt-8 grid gap-3">
        {FAQS.map((f) => (
          <details key={f.q} className="mr-card group p-5">
            <summary className="font-display cursor-pointer font-bold [&::marker]:text-[var(--mr-gold)]">
              {f.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
              {f.a}
            </p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        Still stuck? <Link href="/contact" className="font-semibold underline">Contact us</Link> — include
        the request ID from any error message.
      </p>
    </div>
  );
}

export const metadata = {
  title: "FAQ",
  description: "Accounts, pricing, Dice fairness, Movie Night invites, data sources, anime, offline and deletion — answered.",
};
