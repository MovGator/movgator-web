import Link from "next/link";
export const metadata = { title: "Offline" };
export default function OfflinePage() {
  return (
    <div className="mr-card mx-auto max-w-md p-8 text-center">
      <h1 className="font-display text-2xl font-bold">You&rsquo;re offline</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        MovGator needs a connection for the catalogue and Movie Night votes. Your saved pages
        stay cached — reconnect and keep browsing.
      </p>
      <p className="mt-4">
        <Link href="/home" className="mr-btn-primary inline-block px-5 py-2.5">
          Try again
        </Link>
      </p>
    </div>
  );
}
