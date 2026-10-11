"use client";
import Link from "next/link";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MagnifyingGlass, Funnel, X, CaretDown, CaretUp } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { MOODS, genresForMood } from "@/lib/moods";
import type { Genre, Title } from "@/lib/types";
import { EmptyState, MovieCard, Skeleton } from "@/components/Movie";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";

function DiscoverInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { me } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [items, setItems] = useState<Title[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [prefs, setPrefs] = useState<{ favourite_genres: string[]; include_anime: boolean } | null>(null);

  // Pagination state
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // UI state for collapsible sections
  const [showFilters, setShowFilters] = useState(false);
  const [showMoods, setShowMoods] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const q = params.get("q") ?? "";
  const genre = params.get("genre") ?? "";
  const mood = params.get("mood") ?? "";
  const media = params.get("media") ?? "";
  const anime = params.get("anime") ?? "";
  const sort = params.get("sort") ?? "popular";
  const moodGenres = genresForMood(mood);
  const effectiveGenre = genre || moodGenres.join(",");

  const [draft, setDraft] = useState(q);
  useEffect(() => setDraft(q), [q]);

  useEffect(() => {
    api.genres().then(setGenres).catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    if (me) api.prefs().then(setPrefs).catch(() => setPrefs(null));
    else setPrefs(null);
  }, [me]);

  const searchKey = `${q}|${effectiveGenre}|${media}|${anime}|${sort}`;

  const loadInitial = useCallback(async () => {
    setState("loading");
    setError(null);
    setItems([]);
    setSeenIds(new Set());
    setCursor(null);
    setHasMore(true);
    try {
      const r = await api.search({ q, genre: effectiveGenre, media_type: media, anime, sort, limit: 24 });
      setItems(r.items);
      setSeenIds(new Set(r.items.map(t => t.id)));
      setTotal(r.total);
      setCursor(r.next_cursor);
      setHasMore(r.next_cursor !== null);
      setState("ok");
    } catch {
      setState("error");
    }
  }, [q, effectiveGenre, media, anime, sort, searchKey]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || cursor === null) return;

    setLoadingMore(true);
    setError(null);

    try {
      const r = await api.search({ q, genre: effectiveGenre, media_type: media, anime, sort, cursor, limit: 24 });
      const newItems = r.items.filter(t => !seenIds.has(t.id));

      if (newItems.length === 0) {
        setHasMore(false);
        return;
      }

      setItems(prev => [...prev, ...newItems]);
      setSeenIds(prev => {
        const next = new Set(prev);
        newItems.forEach(t => next.add(t.id));
        return next;
      });

      if (r.next_cursor !== null) {
        setCursor(r.next_cursor);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more movies");
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, hasMore, seenIds, q, effectiveGenre, media, anime, sort]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`/discover?${next.toString()}`);
  };

  const clearAllFilters = () => {
    set({ q: "", genre: "", mood: "", media: "", anime: "", sort: "popular" });
  };

  const hasActiveFilters = genre || mood || media || anime || sort !== "popular";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear genre and mood filters when searching by name so search works independently
    set({ q: draft, genre: "", mood: "" });
  };

  const activeFilterCount = (genre ? 1 : 0) + (mood ? 1 : 0) + (media ? 1 : 0) + (anime ? 1 : 0) + (sort !== "popular" ? 1 : 0);

  return (
    <div>
      <AppBar title="Discover" showBack={false} brand />
      
      {/* Hero Search Section */}
      <section className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Discover Movies</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Search, filter, and explore our curated catalog of movies and anime
          </p>
        </header>

        {/* Main Search Bar */}
        <form role="search" className="mb-6" onSubmit={handleSearch}>
          <label htmlFor="discover-q" className="sr-only">Search movies and anime</label>
          <div className="relative">
            <MagnifyingGlass size={20} weight="regular" aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--mr-ink-soft)" }} />
            <input
              id="discover-q"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search films and anime…"
              className="mr-card min-h-[48px] w-full pl-12 pr-12 py-3 text-base"
              autoComplete="off"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 mr-btn-primary inline-flex items-center gap-2 px-5">
              <MagnifyingGlass size={18} weight="regular" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        {/* Active Filters Bar */}
        {(q || hasActiveFilters) && (
          <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Active filters">
            {q && (
              <span className="mr-chip flex items-center gap-1.5 px-3 py-1.5">
                <span className="font-medium">Search:</span>
                <span className="truncate max-w-[200px]">{q}</span>
                <button type="button" onClick={() => set({ q: "" })} aria-label="Remove search" className="ml-1">
                  <X size={14} weight="regular" aria-hidden="true" />
                </button>
              </span>
            )}
            {genre && (
              <span className="mr-chip flex items-center gap-1.5 px-3 py-1.5" style={{ background: "var(--mr-gold)", color: "#24102e" }}>
                <span className="font-medium">Genre:</span>
                <span>{genres.find(g => g.id === genre)?.label || genre}</span>
                <button type="button" onClick={() => set({ genre: "", mood: "" })} aria-label="Remove genre" className="ml-1">
                  <X size={14} weight="regular" aria-hidden="true" />
                </button>
              </span>
            )}
            {mood && !genre && (
              <span className="mr-chip flex items-center gap-1.5 px-3 py-1.5" style={{ background: "var(--mr-plum)", color: "#fff" }}>
                <span className="font-medium">Mood:</span>
                <span>{MOODS.find(m => m.id === mood)?.label || mood}</span>
                <button type="button" onClick={() => set({ mood: "" })} aria-label="Remove mood" className="ml-1">
                  <X size={14} weight="regular" aria-hidden="true" />
                </button>
              </span>
            )}
            {media && (
              <span className="mr-chip flex items-center gap-1.5 px-3 py-1.5">
                <span className="font-medium">Format:</span>
                <span>{media === "movie" ? "Movies" : media === "series" ? "Series" : "Anime"}</span>
                <button type="button" onClick={() => set({ media: "" })} aria-label="Remove format" className="ml-1">
                  <X size={14} weight="regular" aria-hidden="true" />
                </button>
              </span>
            )}
            {anime && (
              <span className="mr-chip flex items-center gap-1.5 px-3 py-1.5">
                <span className="font-medium">Anime:</span>
                <span>{anime === "only" ? "Only anime" : "Exclude anime"}</span>
                <button type="button" onClick={() => set({ anime: "" })} aria-label="Remove anime filter" className="ml-1">
                  <X size={14} weight="regular" aria-hidden="true" />
                </button>
              </span>
            )}
            {sort !== "popular" && (
              <span className="mr-chip flex items-center gap-1.5 px-3 py-1.5">
                <span className="font-medium">Sort:</span>
                <span>{sort === "newest" ? "Newest" : "A–Z"}</span>
                <button type="button" onClick={() => set({ sort: "popular" })} aria-label="Remove sort" className="ml-1">
                  <X size={14} weight="regular" aria-hidden="true" />
                </button>
              </span>
            )}
            {hasActiveFilters && (
              <button type="button" onClick={clearAllFilters} className="mr-chip px-3 py-1.5 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Collapsible Filter Sections */}
        <div className="space-y-4" role="group" aria-label="Filters">
          {/* Quick Filter Toggles */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick filters">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`mr-chip px-4 py-2 text-sm font-semibold flex items-center gap-2 ${showFilters ? "bg-[var(--mr-plum)] text-white" : ""}`}
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              <Funnel size={18} weight="regular" aria-hidden="true" />
              <span>Filters</span>
              <span className={`transition-transform ${showFilters ? "rotate-180" : ""}`}>
                <CaretDown size={16} weight="regular" aria-hidden="true" />
              </span>
            </button>
          </div>

          {/* Filter Panel */}
          <div id="filter-panel" className={`overflow-hidden transition-all duration-300 ${showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`} role="region" aria-label="Filter options">
            <div className="mr-card p-4 space-y-6">
              {/* Mood Filter */}
              <fieldset>
                <legend className="text-sm font-semibold mb-3">Mood</legend>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => set({ mood: "" })}
                    className={`mr-chip px-3 py-1.5 text-sm ${!mood ? "bg-[var(--mr-plum)] text-white" : ""}`}
                    aria-pressed={!mood}
                  >
                    Any mood
                  </button>
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => set({ mood: mood === m.id ? "" : m.id, genre: "" })}
                      className={`mr-chip px-3 py-1.5 text-sm ${mood === m.id ? "bg-[var(--mr-plum)] text-white border-transparent" : ""}`}
                      aria-pressed={mood === m.id}
                      title={`Shows ${m.genres.join(", ")} titles`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Genre Filter */}
              <fieldset>
                <legend className="text-sm font-semibold mb-3">Genre</legend>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => set({ genre: "" })}
                    className={`mr-chip px-3 py-1.5 text-sm ${!genre && !mood ? "bg-[var(--mr-gold)] text-[#24102e]" : ""}`}
                    aria-pressed={!genre && !mood}
                  >
                    All
                  </button>
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => set({ genre: genre === g.id ? "" : g.id, mood: "" })}
                      className={`mr-chip px-3 py-1.5 text-sm ${genre === g.id ? "bg-[var(--mr-gold)] text-[#24102e]" : ""}`}
                      aria-pressed={genre === g.id}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Advanced Filters Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mr-chip flex items-center gap-2 px-3 py-2 text-sm font-medium w-full"
                aria-expanded={showAdvanced}
                aria-controls="advanced-filters"
              >
                <span>Advanced filters</span>
                <span className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}>
<CaretDown size={16} weight="regular" aria-hidden="true" />
                </span>
              </button>

              {/* Advanced Filters Panel */}
              <div id="advanced-filters" className={`overflow-hidden transition-all duration-300 ${showAdvanced ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`} role="region" aria-label="Advanced filter options">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="mr-card flex flex-col gap-1 p-3 text-sm">
                    Format
                    <select
                      aria-label="Media type"
                      value={media}
                      onChange={(e) => set({ media: e.target.value })}
                      className="bg-transparent font-semibold"
                    >
                      <option value="">All</option>
                      <option value="movie">Movies</option>
                      <option value="anime">Anime</option>
                      <option value="series">Series</option>
                    </select>
                  </label>
                  <label className="mr-card flex flex-col gap-1 p-3 text-sm">
                    Anime
                    <select aria-label="Anime filter" value={anime} onChange={(e) => set({ anime: e.target.value })} className="bg-transparent font-semibold">
                      <option value="">Include</option>
                      <option value="only">Only anime</option>
                      <option value="exclude">Exclude anime</option>
                    </select>
                  </label>
                  <label className="mr-card flex flex-col gap-1 p-3 text-sm">
                    Sort
                    <select aria-label="Sort order" value={sort} onChange={(e) => set({ sort: e.target.value })} className="bg-transparent font-semibold">
                      <option value="popular">Most popular</option>
                      <option value="newest">Newest</option>
                      <option value="az">A–Z</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          <p className="text-sm" role="status" style={{ color: "var(--mr-ink-soft)" }}>
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
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((t) => (
                  <MovieCard key={t.id} title={t} />
                ))}
              </div>
              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--mr-plum)] border-t-transparent" aria-label="Loading more movies" />
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="mr-chip px-4 py-2 text-sm font-semibold"
                  >
                    Retry
                  </button>
                </div>
              )}
              {/* Sentinel for infinite scroll */}
              {hasMore && (
                <div ref={sentinelRef} className="h-4" aria-hidden="true" />
              )}
            </>
          )}
        </div>
      </section>
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