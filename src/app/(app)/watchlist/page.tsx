"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, Trash } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Title } from "@/lib/types";
import { EmptyState, MovieCard, Skeleton } from "@/components/Movie";
import { Button } from "@/components/Button";
import { AppBar } from "@/components/AppBar";

type SortKey = "az" | "newest" | "oldest" | "type";

export default function WatchlistPage() {
  const { me, loading } = useAuth();
  const [items, setItems] = useState<Title[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [query, setQuery] = useState("");
  const [media, setMedia] = useState("");
  const [sort, setSort] = useState<SortKey>("az");

  const load = () => {
    setState("loading");
    api
      .watchlist()
      .then((r) => {
        setItems(r);
        setState("ok");
      })
      .catch(() => setState("error"));
  };
  useEffect(load, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((t) => {
      if (media && t.media_type !== media) return false;
      if (q && !`${t.title} ${t.synopsis ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "newest") return (b.release_year ?? 0) - (a.release_year ?? 0);
      if (sort === "oldest") return (a.release_year ?? 0) - (b.release_year ?? 0);
      return a.media_type.localeCompare(b.media_type) || a.title.localeCompare(b.title);
    });
    return list;
  }, [items, query, media, sort]);

  if (!loading && !me) {
    return (
      <div className="mx-auto max-w-md">
        <AppBar title="My Watchlist" backFallback="/profile" />
        <h1 className="font-display text-3xl font-extrabold">My Watchlist</h1>
        <div className="mt-4">
          <EmptyState
            title="Sign in to keep a list"
            body="Your watchlist syncs across devices once you have an account. Browsing stays free."
            action={
              <Link href="/profile?next=/watchlist">
                <Button variant="primary">Sign in</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppBar title="My Watchlist" backFallback="/profile" />
      <h1 className="font-display text-3xl font-extrabold">My Watchlist</h1>
      <p className="mt-1 text-sm" role="status" style={{ color: "var(--mr-ink-soft)" }}>
        {state === "ok" ? `${visible.length} of ${items.length} saved` : " "}
      </p>

      {state === "loading" && <div className="mt-4"><Skeleton label="Loading your watchlist" count={5} /></div>}
      {state === "error" && (
        <div className="mt-4">
          <EmptyState
            title="Couldn't load your list"
            body="Check your connection and try again."
            action={<Button variant="primary" onClick={load}>Retry</Button>}
          />
        </div>
      )}
      {state === "ok" && items.length === 0 && (
        <div className="mt-4">
          <EmptyState
            title="Nothing saved yet"
            body="Tap “Save for later” on any title — from Discover, Dice or a Movie Night shortlist."
            action={
              <Link href="/discover">
                <Button variant="primary">Find something</Button>
              </Link>
            }
          />
        </div>
      )}
      {state === "ok" && items.length > 0 && (
        <>
          <div className="mt-4 flex flex-col gap-3">
            <div className="relative">
              <MagnifyingGlass size={18} weight="regular" aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--mr-ink-soft)" }} />
              <label htmlFor="watchlist-q" className="sr-only">Search your watchlist</label>
              <input
                id="watchlist-q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your saved titles…"
                autoComplete="off"
                className="mr-card min-h-[44px] w-full pl-10 pr-3"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Watchlist filters">
              {["", "movie", "anime", "series"].map((m) => (
                <button
                  key={m || "all"}
                  type="button"
                  onClick={() => setMedia(m)}
                  aria-pressed={media === m}
                  className={`mr-chip px-3 py-1 text-sm ${media === m ? "bg-[var(--mr-plum)] text-white" : ""}`}
                >
                  {m === "" ? "All formats" : m === "movie" ? "Movies" : m === "anime" ? "Anime" : "Series"}
                </button>
              ))}
              <label className="mr-chip flex items-center gap-2 px-3 py-1 text-sm">
                Sort
                <select aria-label="Sort watchlist" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="bg-transparent font-semibold">
                  <option value="az">A–Z</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="type">By format</option>
                </select>
              </label>
              {(query || media || sort !== "az") && (
                <button type="button" onClick={() => { setQuery(""); setMedia(""); setSort("az"); }} className="mr-chip px-3 py-1 text-sm">
                  Clear
                </button>
              )}
            </div>
          </div>
          {visible.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No matches in your list" body="Try a different search or clear the filters." />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((t) => (
                <div key={t.id} className="relative">
                  <MovieCard title={t} />
                  <button
                    type="button"
                    onClick={async () => {
                      await api.watchlistRm(t.id).catch(() => null);
                      setItems((cur) => cur.filter((x) => x.id !== t.id));
                    }}
                    aria-label={`Remove ${t.title} from watchlist`}
                    title="Remove"
                    className="mr-chip absolute right-1 top-1 inline-flex items-center justify-center bg-[var(--mr-surface)] p-2"
                  >
                    <Trash size={16} weight="regular" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
