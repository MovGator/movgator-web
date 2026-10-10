import Link from "next/link";
import { Button } from "@/components/Button";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
        About
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold md:text-5xl">
        The average evening loses 20 minutes to choosing.
      </h1>
      <div className="mt-6 flex flex-col gap-4 text-base leading-relaxed">
        <p>
          MovGator exists for one problem: groups of people, each with a streaming queue a
          mile long, unable to agree on a single film before the popcorn goes cold. Endless
          catalogues didn&rsquo;t fix choosing — they made it heavier.
        </p>
        <p>
          So MovGator is deliberately small in scope. It helps you <strong>discover</strong>{" "}
          something worth two hours, <strong>decide</strong> with a mechanism everyone
          trusts — a fair random pick or a live vote — and then get out of the way.
        </p>
        <h2 className="font-display mt-4 text-2xl font-bold">What we refuse to do</h2>
        <ul className="grid list-disc gap-2 pl-6" style={{ color: "var(--mr-ink-soft)" }}>
          <li>No sign-in walls on browsing. The feed, search, titles and dice are public.</li>
          <li>No fake personalization. Popular means popular; five swipes are a hint, not a profile.</li>
          <li>No invented data. Ratings are source-labelled; missing artwork, cast or availability is stated, not fabricated.</li>
          <li>No randomness dressed as AI. The dice shows its candidate count.</li>
        </ul>
        <h2 className="font-display mt-4 text-2xl font-bold">Built on open shoulders</h2>
        <p style={{ color: "var(--mr-ink-soft)" }}>
          Movie metadata comes from TMDB (attributed; this product is not endorsed by TMDB),
          avatars from the open-source Navii project, anime treated as a first-class
          catalogue citizen. When provider keys aren&rsquo;t configured, the app runs on a
          clearly labelled demo catalogue instead of pretending.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/get-started">
          <Button variant="gold">Try MovGator free</Button>
        </Link>
        <Link href="/use-cases">
          <Button variant="ghost">Who is it for?</Button>
        </Link>
      </div>
    </div>
  );
}

export const metadata = {
  title: "About",
  description: "Why MovGator exists: ending the what-to-watch debate with honest discovery and fair group decisions.",
};
