import Link from "next/link";
import { Button } from "@/components/Button";

export default function FeaturesPage() {
  return (
    <div>
      <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
        Features
      </p>
      <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold md:text-5xl">
        Everything you need to pick the night&rsquo;s film.
      </h1>
      <p className="mt-3 max-w-2xl text-lg" style={{ color: "var(--mr-ink-soft)" }}>
        Six tools, one job: ending the &ldquo;what should we watch?&rdquo; debate.
        Browsing is free and needs no account.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <section className="mr-card p-6">
          <h2 className="font-display text-xl font-bold">A feed that respects your evening</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
            Popular right now, coming soon, and hidden gems — editorial shelves built from
            real catalogue data, not engagement bait. Nobody calls generic charts
            &ldquo;personalized for you.&rdquo;
          </p>
          <Link href="/home" className="mt-3 inline-block text-sm font-semibold underline">Browse the feed</Link>
        </section>
        <section className="mr-card p-6">
          <h2 className="font-display text-xl font-bold">Search that speaks anime too</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
            Title search plus genre, format and anime filters with shareable URLs.
            Anime is a first-class citizen — its own category, filters, onboarding and dice
            option — never a single generic genre tag.
          </p>
          <Link href="/discover?anime=only" className="mt-3 inline-block text-sm font-semibold underline">Browse anime only</Link>
        </section>
        <section className="mr-card p-6">
          <h2 className="font-display text-xl font-bold">Title pages with honest ratings</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
            Every score is labelled by source. Provider scores and community scores are never
            mixed, and sections that lack reliable data say so instead of inventing links,
            cast lists or availability.
          </p>
          <Link href="/discover" className="mt-3 inline-block text-sm font-semibold underline">Try Discover</Link>
        </section>
        <section className="mr-card p-6">
          <h2 className="font-display text-xl font-bold">Roll the Dice</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
            Set a few filters, tap the dice, get one uniform-random pick with its candidate
            count shown. Randomness — openly, not &ldquo;AI magic.&rdquo; Signed-in members
            can auto-exclude what they&rsquo;ve watched.
          </p>
          <Link href="/dice" className="mt-3 inline-block text-sm font-semibold underline">Roll now, no account</Link>
        </section>
        <section className="mr-card p-6">
          <h2 className="font-display text-xl font-bold">Movie Night, decided live</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
            Share an invite link, add candidates, vote in real time with reconnect recovery.
            One active vote per person, ties surfaced, winners computed on the server —
            never in the browser.
          </p>
          <Link href="/movie-night" className="mt-3 inline-block text-sm font-semibold underline">Host a night</Link>
        </section>
        <section className="mr-card p-6">
          <h2 className="font-display text-xl font-bold">Taste that starts with five swipes</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
            Pick genres, swipe five real recommendations — keyboard and buttons included —
            and MovGator keeps the signal as a starting hint. Five swipes are a beginning,
            and we say so.
          </p>
          <Link href="/onboarding" className="mt-3 inline-block text-sm font-semibold underline">Try onboarding</Link>
        </section>
      </div>

      <div className="mt-10 text-center">
        <Link href="/get-started">
          <Button variant="gold">Get started — free to browse</Button>
        </Link>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Features",
  description: "Discover feed, anime-first search, honest title pages, Roll the Dice, live Movie Nights and five-swipe onboarding.",
};
