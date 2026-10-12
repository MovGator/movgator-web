import Link from "next/link";
import type { Title } from "@/lib/types";
import { PosterArt } from "./PosterArt";
import { MatureCover } from "./MatureCover";

export function GenreChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className="mr-chip px-2.5 py-1 text-xs font-medium"
      style={active ? { background: "var(--mr-gold)", color: "#24102e", borderColor: "transparent" } : undefined}
    >
      {label}
    </span>
  );
}

export function CertBadge({ certification }: { certification: string }) {
  return (
    <span
      className="cert-badge"
      title={`Rated ${certification}`}
      aria-label={`Rated ${certification}`}
    >
      {certification}
    </span>
  );
}

export function MovieCard({ title }: { title: Title }) {
  return (
    <div className="group block">
      <MatureCover title={title}>
        <Link
          href={`/title/${title.id}`}
          className="block"
          aria-label={`${title.title}${title.release_year ? ` (${title.release_year})` : ""}${title.certification ? `, rated ${title.certification}` : ""}`}
        >
          <PosterArt title={title} />
        </Link>
      </MatureCover>
      <p className="mt-2 truncate text-sm font-semibold">
        <Link
          href={`/title/${title.id}`}
          className="group-hover:underline"
          aria-label={`${title.title}${title.release_year ? ` (${title.release_year})` : ""}`}
        >
          {title.title}
        </Link>
      </p>
      <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
        {[title.release_year, title.media_type === "anime" ? "Anime" : null].filter(Boolean).join(" · ")}
        {title.certification && (
          <>
            {" · "}
            <CertBadge certification={title.certification} />
          </>
        )}
      </p>
    </div>
  );
}

export function PosterRail({ heading, items, href }: { heading: string; items: Title[]; href?: string }) {
  if (!items.length) return null;
  return (
    <section aria-label={heading} className="mt-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold">{heading}</h2>
        {href && (
          <Link href={href} className="text-sm font-semibold underline">
            See all
          </Link>
        )}
      </div>
      <div className="rail">
        {items.map((t) => (
          <MovieCard key={t.id} title={t} />
        ))}
      </div>
    </section>
  );
}

export function Skeleton({ label = "Loading", count = 5 }: { label?: string; count?: number }) {
  return (
    <div role="status" aria-label={label} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton aspect-[2/3] rounded-lg" />
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="mr-card mx-auto max-w-md p-8 text-center">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        {body}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
