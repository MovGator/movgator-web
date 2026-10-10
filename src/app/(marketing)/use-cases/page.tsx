import Link from "next/link";
import { Button } from "@/components/Button";

const CASES = [
  {
    title: "The solo scroller",
    body: "You open three apps, scroll for half an hour, rewatch something. Set a runtime cap and two genres, roll the dice once, and commit — with the candidate count proving the pick was fair.",
    link: { href: "/dice", label: "Roll the Dice" },
  },
  {
    title: "The couple with opposite taste",
    body: "One loves horror, the other comedy. Filter to what overlaps, roll together — or each add a candidate to a two-person Movie Night and let the vote settle it without a debate.",
    link: { href: "/movie-night", label: "Start a night for two" },
  },
  {
    title: "The Friday group chat",
    body: "Six friends, six queues. The host creates a night, drops the invite link in the chat, everyone adds one candidate and votes live. Ties are shown openly; the majority winner takes the evening — guests need no account.",
    link: { href: "/how-it-works", label: "How a night runs" },
  },
  {
    title: "The anime-curious",
    body: "Anime lives everywhere in MovGator — its own filters, onboarding picks, dice toggle and feed presence. Newcomers can explore the medium without signing up for a fandom first.",
    link: { href: "/discover?anime=only", label: "Browse anime" },
  },
  {
    title: "The list keeper",
    body: "You save everything and watch nothing. Keep one watchlist, mark watched, rate honestly — your taste compounds into better starting points across Discover and Dice.",
    link: { href: "/profile", label: "Keep your list" },
  },
];

export default function UseCasesPage() {
  return (
    <div>
      <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
        Use cases
      </p>
      <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold md:text-5xl">
        Made for the way you actually watch.
      </h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {CASES.map((c) => (
          <section key={c.title} className="mr-card flex flex-col p-6">
            <h2 className="font-display text-xl font-bold">{c.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
              {c.body}
            </p>
            <Link href={c.link.href} className="mt-4 text-sm font-semibold underline">
              {c.link.label}
            </Link>
          </section>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/get-started">
          <Button variant="gold">Get started free</Button>
        </Link>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Use cases",
  description: "Solo viewers, couples, friend groups, anime newcomers and list keepers — how each uses MovGator.",
};
