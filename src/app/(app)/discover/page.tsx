"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CardsThree, MagnifyingGlass } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { MOODS, genresForMood } from "@/lib/moods";
import type { Genre, Title } from "@/lib/types";
import { EmptyState, MovieCard, Skeleton } from "@/components/Movie";
import { AppBar } from "@/components/AppBar";

function DiscoverInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { me } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [items, setItems] = useState<Title[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [prefs, setPrefs] = useState<{ favourite_genres: string[]; include_anime: boolean } | null>(null);

  const q = params.get("q") ?? "";
  const genre = params.get("genre") ?? "";
  const mood = params.get("mood") ?? "";
  const media = params.get("media") ?? "";
  const anime = params.get("anime") ?? "";
  const sort = params.get("sort") ?? "popular";
  // Moods map onto real genre slugs (see lib/moods.ts); explicit genre wins.
  const effectiveGenre = genre || genresForMood(mood)[0] || "";

  const [draft, setDraft] = useState(q);
  useEffect(() => setDraft(q), [q]);

  useEffect(() => {
    api.genres().then(setGenres).catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    if (me) api.prefs().then(setPrefs).catch(() => setPrefs(null));
    else setPrefs(null);
  }, [me]);

  useEffect(() => {
    setState("loading");
    api
      .search({ q, genre: effectiveGenre, media_type: media, anime, sort, limit: 24 })
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
        setState("ok");
      })
      .catch(() => setState("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, effectiveGenre, media, anime, sort]);

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`/discover?${next.toString()}`);
  };

  return (
    <div>
      <AppBar title="Discover" showBack={false} brand />
      <h1 className="font-display text-3xl font-extrabold">Discover</h1>
      <form
        role="search"
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          set({ q: draft });
        }}
      >
        <label htmlFor="discover-q" className="sr-only">
          Search titles
        </label>
        <input
          id="discover-q"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search films and anime…"
          className="mr-card min-h-[44px] flex-1 px-4"
          autoComplete="off"
        />
        <button type="submit" className="mr-btn-primary inline-flex items-center gap-2 px-5">
          <MagnifyingGlass size={18} weight="regular" aria-hidden="true" />
          Search
        </button>
      </form>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Link href="/onboarding" className="mr-card group flex items-center gap-3 p-4">
          <span className="mr-btn-gold inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full" aria-hidden="true">
            <CardsThree size={20} weight="regular" />
          </span>
          <span>
            <span className="block font-bold group-hover:underline">Swipe to Discover</span>
            <span className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              Five quick swipes tune your taste — keyboard and buttons included.
            </span>
          </span>
        </Link>
        <div className="mr-card p-4" aria-live="polite">
          <p className="text-sm font-bold">Your taste</p>
          {me && prefs ? (
            <p className="mt-1 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              {prefs.favourite_genres.length
                ? `Loves ${prefs.favourite_genres.slice(0, 5).join(", ")}${prefs.include_anime ? " · anime in" : " · anime out"}.`
                : "No genres saved yet — swipe to teach it."}{" "}
              <Link href="/onboarding" className="underline">Refine</Link>
              {" · "}
              <Link href="/profile" className="underline">Settings</Link>
            </p>
          ) : (
            <p className="mt-1 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              <Link href="/profile?next=/discover" className="underline">Sign in</Link> to
              keep taste across devices — browsing stays free.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4" role="group" aria-label="Mood filter">
        <p className="text-xs font-semibold" style={{ color: "var(--mr-ink-soft)" }}>
          Mood <span className="font-normal">(maps to genres — same real filter underneath)</span>
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <button type="button" onClick={() => set({ mood: "" })} className="mr-chip px-3 py-1 text-sm" aria-pressed={!mood}>
            Any mood
          </button>
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => set({ mood: mood === m.id ? "" : m.id, genre: "" })}
              className="mr-chip px-3 py-1 text-sm"
              aria-pressed={mood === m.id}
              title={`Shows ${m.genres.join(", ")} titles`}
              style={mood === m.id ? { background: "var(--mr-plum)", color: "#fff", borderColor: "transparent" } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Genre filter">
        <button type="button" onClick={() => set({ genre: "" })} className="mr-chip px-3 py-1 text-sm" aria-pressed={!genre}>
          All
        </button>
        {genres.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => set({ genre: genre === g.id ? "" : g.id, mood: "" })}
            className="mr-chip px-3 py-1 text-sm"
            aria-pressed={genre === g.id}
            style={genre === g.id ? { background: "var(--mr-gold)", color: "#24102e" } : undefined}
          >
            {g.label}
          </button>
        ))}
      </div>
      {mood && !genre && (
        <p className="mt-2 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
          Showing {genresForMood(mood).join(" + ")} titles for “{MOODS.find((m) => m.id === mood)?.label}”.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <label className="mr-chip flex items-center gap-2 px-3 py-1">
          Format
          <select
            aria-label="Media type"
            value={media}
            onChange={(e) => set({ media: e.target.value })}
            className="bg-transparent"
          >
            <option value="">All</option>
            <option value="movie">Movies</option>
            <option value="anime">Anime</option>
            <option value="series">Series</option>
          </select>
        </label>
        <label className="mr-chip flex items-center gap-2 px-3 py-1">
          Anime
          <select aria-label="Anime filter" value={anime} onChange={(e) => set({ anime: e.target.value })} className="bg-transparent">
            <option value="">Include</option>
            <option value="only">Only anime</option>
            <option value="exclude">Exclude anime</option>
          </select>
        </label>
        <label className="mr-chip flex items-center gap-2 px-3 py-1">
          Sort
          <select aria-label="Sort order" value={sort} onChange={(e) => set({ sort: e.target.value })} className="bg-transparent">
            <option value="popular">Most popular</option>
            <option value="newest">Newest</option>
            <option value="az">A–Z</option>
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm" role="status" style={{ color: "var(--mr-ink-soft)" }}>
        {state === "ok" ? `${total} result${total === 1 ? "" : "s"}` : " "}
      </p>

      {state === "loading" && <Skeleton label="Searching titles" />}
      {state === "error" && (
        <EmptyState
          title="Search is unavailable"
          body="The catalogue service isn't responding. Check the backend is running, then try again."
          action={
            <button type="button" className="mr-btn-primary px-5 py-2.5" onClick={() => set({})}>
              Retry
            </button>
          }
        />
      )}
      {state === "ok" && items.length === 0 && (
        <EmptyState
          title="Nothing matches those filters"
          body="Try fewer filters, a different genre, or include anime — the demo catalogue is small."
          action={
            <button type="button" className="mr-btn-primary px-5 py-2.5" onClick={() => router.push("/discover")}>
              Clear filters
            </button>
          }
        />
      )}
      {state === "ok" && items.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((t) => (
            <MovieCard key={t.id} title={t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<p role="status">Loading Discover…</p>}>
      <DiscoverInner />
    </Suspense>
  );
}
