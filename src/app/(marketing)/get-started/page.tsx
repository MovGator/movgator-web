import Link from "next/link";
import { Button } from "@/components/Button";

export default function GetStartedPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
        Get started
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold md:text-5xl">
        Watching something great in the next five minutes.
      </h1>
      <ol className="mt-8 grid list-none gap-4 p-0">
        <li className="mr-card p-6">
          <h2 className="font-display text-xl font-bold">1. Open the app — no sign-up</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            The app lives in your browser. Browse the feed or roll the dice right away.
          </p>
          <div className="mt-3">
            <Link href="/home"><Button variant="primary">Open MovGator now</Button></Link>
          </div>
        </li>
        <li className="mr-card p-6">
          <h2 className="font-display text-xl font-bold">2. Install it like a native app</h2>
          <div className="mt-2 grid gap-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            <p><strong>iPhone / iPad:</strong> open the app in Safari → Share → Add to Home Screen.</p>
            <p><strong>Android:</strong> open the app in Chrome → tap Install when offered, or menu → Install app / Add to Home screen.</p>
            <p><strong>Desktop:</strong> open the app in Chrome or Edge → install icon in the address bar.</p>
            <p>The app itself shows an install card when your browser supports one-tap installation.</p>
          </div>
        </li>
        <li className="mr-card p-6">
          <h2 className="font-display text-xl font-bold">3. Make it yours (optional)</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Pick genres and swipe five titles in <Link href="/onboarding" className="underline">onboarding</Link>,
            then create an account from your <Link href="/profile" className="underline">Profile</Link> to
            keep your watchlist, ratings and taste on every device.
          </p>
        </li>
      </ol>
    </div>
  );
}

export const metadata = {
  title: "Get started",
  description: "Open MovGator in your browser, install it as an app on any device, and optionally create an account.",
};
