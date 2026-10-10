import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import { api } from "@/lib/api";
import type { Title } from "@/lib/types";
import { MovieCard, PosterRail } from "@/components/Movie";
import { PosterArt } from "@/components/PosterArt";

export const revalidate = 120;

async function getFeed() {
  try {
    return await api.feed(0, 12);
  } catch {
    return null;
  }
}

const MARQUEE_WORDS = ["Action", "Anime", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"];

function Marquee() {
  const row = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="marquee" aria-label="Browse every mood">
      <div className="marquee-track">
        {[0, 1].map((half) => (
          <span key={half} aria-hidden={half === 1}>
            {row.map((w) => `${w}  •  `)}
          </span>
        ))}
      </div>
    </div>
  );
}

function Spotlight({ title }: { title: Title }) {
  return (
    <section aria-labelledby="spotlight" className="spotlight mt-10">
      {title.backdrop_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={title.backdrop_url} alt="" aria-hidden="true" className="spotlight-backdrop" />
      )}
      <div className="spotlight-scrim" aria-hidden="true" />
      <PosterArt title={title} />
      <div>
        <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
          Spotlight · {title.media_type === "anime" ? "Anime" : "Film"}
        </p>
        <h2 id="spotlight" className="font-display mt-3 text-3xl font-extrabold md:text-4xl">
          {title.title}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          {[title.release_year, ...(title.genres.slice(0, 3)),
            title.provenance === "tmdb" && title.tmdb_rating != null
              ? `TMDB ${title.tmdb_rating.toFixed(1)}` : null].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-3 max-w-xl leading-relaxed">{title.synopsis}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/title/${title.id}`} className="mkt-cta !min-h-[48px] text-sm">
            <Play size={18} weight="fill" aria-hidden="true" /> View title
          </Link>
          <Link href="/dice" className="inline-flex min-h-[48px] items-center rounded-full border px-6 text-sm font-semibold" style={{ borderColor: "var(--mr-line)" }}>
            Can&rsquo;t choose? Roll
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function LandingPage() {
  const feed = await getFeed();
  const popular = feed?.sections.find((s) => s.key === "popular")?.items ?? [];
  const preview = popular.slice(0, 8);
  const spotlight = popular[0];

  return (
    <div>
      <section aria-labelledby="hero" className="mkt-hero">
        <p className="mr-chip inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ background: "var(--mr-surface-2)" }}>
          Movie &amp; anime discovery
        </p>
        <h1 id="hero" className="mkt-display mx-auto mt-5 max-w-4xl">
          Stop scrolling. Start <span className="accent">watching</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: "var(--mr-ink-soft)" }}>
          MovGator helps you discover films and anime, settle &ldquo;what should we
          watch?&rdquo; with Roll the Dice, and decide together with Movie Night.
        </p>
        <div className="mkt-cta-row">
          <Link href="/home" className="mkt-cta">
            START DISCOVERING
          </Link>
          <Link href="/how-it-works" aria-label="How it works" className="mkt-cta-arrow">
            <ArrowRight size={22} weight="bold" aria-hidden="true" />
          </Link>
        </div>
        <dl className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="font-display text-2xl font-extrabold">{feed?.total ?? "—"}</dt>
            <dd style={{ color: "var(--mr-ink-soft)" }}>Titles to browse free</dd>
          </div>
          <div>
            <dt className="font-display text-2xl font-extrabold">1 tap</dt>
            <dd style={{ color: "var(--mr-ink-soft)" }}>Dice decides for you</dd>
          </div>
          <div>
            <dt className="font-display text-2xl font-extrabold">Live</dt>
            <dd style={{ color: "var(--mr-ink-soft)" }}>Vote with friends</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Tonight's picks" className="cine-panel on-plum">
        {preview.length > 0 ? (
          <>
            <div className="rail" role="list">
              {preview.map((t) => (
                <div role="listitem" key={t.id}>
                  <MovieCard title={t} />
                </div>
              ))}
            </div>
            <p className="cine-caption mt-4 text-center">
              Live from the MovGator catalogue — open the app to browse it all, no sign-up.
            </p>
          </>
        ) : (
          <div className="flex aspect-video items-center justify-center p-8 text-center text-sm text-[#f7f6f8]/80">
            Live catalogue preview loads when the backend is running.
          </div>
        )}
      </section>

      <Marquee />

      {spotlight && <Spotlight title={spotlight} />}

      <section aria-labelledby="how" className="mr-card mt-10 grid gap-6 p-6 md:grid-cols-3 md:p-10">
        <div>
          <h2 id="how" className="font-display text-lg font-bold">1. Discover</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Browse trending titles, hidden gems and anime. Filter by genre, mood and runtime.
          </p>
          <Link href="/discover" className="mt-2 inline-block text-sm font-semibold underline">Open Discover</Link>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">2. Roll the Dice</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Can&rsquo;t choose? Set a few filters and let the dice pick one title — randomly, honestly.
          </p>
          <Link href="/dice" className="mt-2 inline-block text-sm font-semibold underline">Roll now</Link>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">3. Movie Night</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Share an invite link, add candidates, vote live and let the winner take the evening.
          </p>
          <Link href="/movie-night" className="mt-2 inline-block text-sm font-semibold underline">Host a night</Link>
        </div>
      </section>

      {feed && <PosterRail heading="Popular right now" items={popular} href="/home" />}

      <section aria-labelledby="explore" className="mt-12 grid gap-4 sm:grid-cols-3">
        <Link href="/features" className="mr-card block p-5">
          <h2 id="explore" className="font-display font-bold">Explore features</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Dice, live nights, anime-first search and honest ratings.
          </p>
        </Link>
        <Link href="/use-cases" className="mr-card block p-5">
          <h2 className="font-display font-bold">Who it&rsquo;s for</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Solo scrollers, couples, group chats and the anime-curious.
          </p>
        </Link>
        <Link href="/about" className="mr-card block p-5">
          <h2 className="font-display font-bold">Why MovGator</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            The choosing problem — and what we refuse to do about it.
          </p>
        </Link>
      </section>
    </div>
  );
}
