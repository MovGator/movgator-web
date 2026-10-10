import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mr-card mx-auto max-w-md p-8 text-center">
      <h1 className="font-display text-2xl font-bold">That reel is missing</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        The page you asked for doesn&rsquo;t exist or moved.
      </p>
      <p className="mt-4 flex justify-center gap-2">
        <Link href="/home" className="mr-btn-primary inline-block px-5 py-2.5">Back to Home</Link>
        <Link href="/discover" className="mr-chip inline-block px-5 py-2.5">Discover</Link>
      </p>
    </div>
  );
}
