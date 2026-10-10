"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DiceFive, MagnifyingGlass, UsersThree } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Title } from "@/lib/types";
import { PosterArt } from "@/components/PosterArt";
import { GenreChip, Skeleton } from "@/components/Movie";
import { InstallCard } from "@/components/InstallPrompt";
import { AppBar } from "@/components/AppBar";

type TabKey = "foryou" | "trending" | "coming" | "gems";
const TABS: { key: TabKey; label: string }[] = [
  { key: "foryou", label: "For You" },
  { key: "trending", label: "Trending" },
  { key: "coming", label: "Coming Soon" },
  { key: "gems", label: "Hidden Gems" },
];

function Rating({ t }: { t: Title }) {
  if (t.provenance === "tmdb" && t.tmdb_rating != null) {
    return (
      <span className="mr-chip px-2 py-0.5 text-xs font-bold" aria-label={`TMDB score ${t.tmdb_rating.toFixed(1)} out of 10`}>
        ★ {t.tmdb_rating.toFixed(1)}
      </span>
    );
  }
  return null;
}

function GridCard({ t, showReleaseDate }: { t: Title; showReleaseDate?: boolean }) {
  return (
    <Link
      href={`/title/${t.id}`}
      className="group block"
      aria-label={`${t.title}${t.release_year ? ` (${t.release_year})` : ""}`}
    >
      <PosterArt title={t} />
      <p className="mt-2 truncate text-sm font-semibold group-hover:underline">{t.title}</p>
      <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
        {showReleaseDate && t.release_date ? (
          <>
            <time dateTime={t.release_date}>
              {new Date(t.release_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </time>
            {t.media_type === "anime" ? " · Anime" : t.media_type === "series" ? " · Series" : " · Film"}
          </>
        ) : (
          [t.release_year, t.media_type === "anime" ? "Anime" : t.media_type === "series" ? "Series" : "Film"]
            .filter(Boolean)
            .join(" · ")
        )}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <Rating t={t} />
        {t.genres.slice(0, 2).map((g) => (
          <GenreChip key={g} label={g} />
        ))}
      </div>
    </Link>
  );
}

export function HomeHub({
  sections,
  total,
  provenanceNote,
}: {
  sections: Record<string, Title[]>;
  total: number;
  provenanceNote: string;
}) {
  const { me } = useAuth();
  const [tab, setTab] = useState<TabKey>("foryou");
  const [forYou, setForYou] = useState<Title[] | null>(null);
  const [forYouState, setForYouState] = useState<"idle" | "loading" | "ok" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setForYouState("loading");
      try {
        const prefs = me ? await api.prefs().catch(() => null) : null;
        const genres = prefs?.favourite_genres ?? [];
        const recs = await api.onboarding(genres, prefs?.include_anime ?? true);
        if (!cancelled) {
          setForYou(recs);
          setForYouState("ok");
        }
      } catch {
        if (!cancelled) setForYouState("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [me]);

  const items: Title[] =
    tab === "foryou"
      ? forYou ?? sections.popular ?? []
      : tab === "trending"
        ? (sections.popular ?? [])
        : tab === "coming"
          ? (sections.coming ?? [])
          : (sections.gems ?? []);

  const tabRef = (i: number) => (el: HTMLButtonElement | null) => {
    // roving focus managed by arrow-key handler below
    if (el) el.dataset.index = String(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const cur = TABS.findIndex((t) => t.key === tab);
    const next = (cur + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[next].key);
    document.getElementById(`home-tab-${TABS[next].key}`)?.focus();
  };

  return (
    <div>
      <AppBar
        title="Home"
        showBack={false}
        brand
        actions={
          <Link href="/discover" aria-label="Search movies and anime" className="appbar-btn">
            <MagnifyingGlass size={22} weight="regular" aria-hidden="true" />
          </Link>
        }
      />
      <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        A world of movies, picked for you.
      </p>
      <h1 className="font-display mt-1 text-3xl font-extrabold md:text-4xl">Discover your next favourite</h1>
      <p className="mt-2 max-w-xl" style={{ color: "var(--mr-ink-soft)" }}>
        Find something worth watching. Your next great movie is closer than you think —{" "}
        {total} titles{provenanceNote} · free to browse, no sign-in needed.
      </p>

      <div className="mt-4">
        <InstallCard />
      </div>

      {sections.popular?.[0] && (
        <Link
          href={`/title/${sections.popular[0].id}`}
          className="spotlight spotlight-slim group mt-6"
          aria-label={`Spotlight: ${sections.popular[0].title}`}
        >
          {sections.popular[0].backdrop_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sections.popular[0].backdrop_url} alt="" aria-hidden="true" className="spotlight-backdrop" />
          )}
          <div className="spotlight-scrim" aria-hidden="true" />
          <PosterArt title={sections.popular[0]} />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--mr-ink-soft)" }}>
              #1 trending this week
            </p>
            <p className="font-display mt-1 text-xl font-extrabold group-hover:underline">
              {sections.popular[0].title}
            </p>
            <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
              {sections.popular[0].synopsis}
            </p>
          </div>
        </Link>
      )}

      <div
        role="tablist"
        aria-label="Discovery categories"
        onKeyDown={onKeyDown}
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
      >
        {TABS.map((t, i) => (
          <button
            key={t.key}
            id={`home-tab-${t.key}`}
            ref={tabRef(i)}
            role="tab"
            aria-selected={tab === t.key}
            aria-controls="home-tabpanel"
            tabIndex={tab === t.key ? 0 : -1}
            onClick={() => setTab(t.key)}
            className="mr-chip shrink-0 px-4 py-2 text-sm font-semibold"
            style={tab === t.key ? { background: "var(--mr-plum)", color: "#fff", borderColor: "transparent" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="home-tabpanel" role="tabpanel" aria-live="polite" className="mt-4">
        {tab === "foryou" && forYouState === "loading" && <Skeleton label="Loading your picks" />}
        {tab === "foryou" && forYouState === "error" && (
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Couldn&rsquo;t load personal picks — showing popular titles instead.
          </p>
        )}
        {tab === "foryou" && (
          <p className="mb-3 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
            {me
              ? "Based on your saved genres and swipes — a starting hint, not a finished profile."
              : "Popular titles for now — sign in and finish onboarding for picks tuned to you."}
          </p>
        )}
        {items.length === 0 && forYouState !== "loading" ? (
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Nothing here yet — try another tab.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((t) => (
              <GridCard key={t.id} t={t} showReleaseDate={tab === "coming"} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Link href="/dice" className="mr-card group flex items-center gap-4 p-5">
          <span className="mr-btn-gold inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full" aria-hidden="true">
            <DiceFive size={24} weight="regular" />
          </span>
          <span>
            <span className="font-display block text-lg font-bold group-hover:underline">Can&rsquo;t decide?</span>
            <span className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
              Let the dice pick your next movie.
            </span>
          </span>
        </Link>
        <Link href="/movie-night" className="mr-card group flex items-center gap-4 p-5">
          <span
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--mr-plum)", color: "#fff" }}
            aria-hidden="true"
          >
            <UsersThree size={24} weight="regular" />
          </span>
          <span>
            <span className="font-display block text-lg font-bold group-hover:underline">Watching with friends?</span>
            <span className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
              Start a Movie Night and vote together.
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}

export function HomeError() {
  return (
    <div>
      <AppBar title="Home" showBack={false} brand />
      <div className="mr-card p-8 text-center">
        <h1 className="font-display text-xl font-bold">Couldn&rsquo;t reach the catalogue</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          Start the backend (<code>uvicorn app.main:app</code> in movgator-backend) and reload.
        </p>
      </div>
    </div>
  );
}
