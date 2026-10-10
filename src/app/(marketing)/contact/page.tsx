import Link from "next/link";
import { Button } from "@/components/Button";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
        Contact
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold md:text-5xl">
        Talk to the people behind MovGator.
      </h1>
      <div className="mt-8 grid gap-4">
        <section className="mr-card p-6" aria-labelledby="bug">
          <h2 id="bug" className="font-display text-xl font-bold">Report a problem</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
            Tell us what you were doing, what you expected, and what happened instead. If you
            saw an error, include its <strong>request ID</strong> — it lets us find your exact
            log line. Screenshots of the title or night code help too.
          </p>
        </section>
        <section className="mr-card p-6" aria-labelledby="account">
          <h2 id="account" className="font-display text-xl font-bold">Account and data requests</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
            Most things are self-serve: update your name and avatar from your{" "}
            <Link href="/profile" className="underline">Profile</Link>, export nothing
            (we keep it minimal), or delete everything from Profile → Delete account.
            Anything else — write in with the email on your account.
          </p>
        </section>
        <section className="mr-card p-6" aria-labelledby="channel">
          <h2 id="channel" className="font-display text-xl font-bold">Where to reach us</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
            A dedicated support channel opens at public launch and will be published here.
            Until then, the project team receives reports through the usual project
            channels — please don&rsquo;t post passwords, invite tokens or personal data
            in public threads.
          </p>
        </section>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/faq">
          <Button variant="ghost">Check the FAQ first</Button>
        </Link>
        <Link href="/get-started">
          <Button variant="gold">Open the app</Button>
        </Link>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Contact",
  description: "Report a problem, manage account and data requests, and find MovGator support channels.",
};
