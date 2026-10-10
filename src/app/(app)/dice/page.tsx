"use client";
import { useEffect, useState } from "react";
import { DiceFive } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { MOODS } from "@/lib/moods";
import type { Genre, Title } from "@/lib/types";
import { EmptyState, GenreChip } from "@/components/Movie";
import { Button } from "@/components/Button";
import { PosterArt } from "@/components/PosterArt";
import { AuthPrompt } from "@/components/AuthPrompt";
import { AppBar } from "@/components/AppBar";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";

export default function DicePage() {
  const { me } = useAuth();
  const { push } = useToast();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [media, setMedia] = useState("");
  const [includeAnime, setIncludeAnime] = useState(true);
  const [maxRuntime, setMaxRuntime] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<Title | null>(null);
  const [count, setCount] = useState(0);
  const [empty, setEmpty] = useState(false);
  const [excluded, setExcluded] = useState<string[]>([]);

  useEffect(() => {
    api.genres().then(setGenres).catch(() => setGenres([]));
  }, []);
  // Mood maps onto real genre slugs; explicit genre picks take precedence.
  const moodGenres = MOODS.find((m) => m.id === mood)?.genres ?? [];
  const activeGenres = picked.length ? picked : moodGenres;

  const clearAll = () => {
    setPicked([]); setMood(""); setMedia(""); setMaxRuntime("");
    setMinYear(""); setMaxYear(""); setMinRating(""); setIncludeAnime(true);
  };

  const roll = async () => {
    setRolling(true);
    setEmpty(false);
    // Restrained rolling moment, skipped animation under reduced motion.
    await new Promise((r) => setTimeout(r, 900));
    try {
      const r = await api.dice({
        genre_ids: activeGenres,
        media_type: media,
        include_anime: includeAnime,
        max_runtime: maxRuntime ? Number(maxRuntime) : null,
        min_year: minYear ? Number(minYear) : null,
        max_year: maxYear ? Number(maxYear) : null,
        min_rating: minRating ? Number(minRating) : null,
        exclude_ids: excluded,
      });
      setCount(r.candidate_count);
      setResult(r.pick);
      setEmpty(!r.pick);
    } catch (e) {
      push(e instanceof ApiError ? e.message : "The dice fell off the table. Try again.");
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <AppBar title="Roll the Dice" showBack={false} brand />
      <h1 className="font-display text-3xl font-extrabold">Roll the Dice</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        No account needed. The dice picks uniformly at random from titles matching your
        filters — randomness, not AI.
      </p>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold">Genres (optional)</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {genres.map((g) => {
            const on = picked.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked((p) => (on ? p.filter((x) => x !== g.id) : [...p, g.id].slice(0, 5)))}
                className="mr-chip px-3 py-1.5 text-sm"
                style={on ? { background: "var(--mr-plum)", color: "#fff" } : undefined}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4">
        <p className="text-sm font-semibold" id="dice-mood">Mood <span className="font-normal" style={{ color: "var(--mr-ink-soft)" }}>(maps to genres)</span></p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="dice-mood">
          {MOODS.map((m) => {
            const on = mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                title={`Shows ${m.genres.join(", ")} titles`}
                onClick={() => setMood(on ? "" : m.id)}
                className="mr-chip px-3 py-1.5 text-sm"
                style={on ? { background: "var(--mr-plum)", color: "#fff", borderColor: "transparent" } : undefined}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="mr-card flex flex-col gap-1 p-3 text-sm">
          Format
          <select value={media} onChange={(e) => setMedia(e.target.value)} className="bg-transparent font-semibold">
            <option value="">Any</option>
            <option value="movie">Movies</option>
            <option value="anime">Anime</option>
            <option value="series">Series</option>
          </select>
        </label>
        <label className="mr-card flex flex-col gap-1 p-3 text-sm">
          Max runtime (min)
          <input
            type="number"
            min={20}
            max={400}
            value={maxRuntime}
            onChange={(e) => setMaxRuntime(e.target.value)}
            placeholder="Any"
            className="bg-transparent font-semibold"
          />
        </label>
        <label className="mr-card flex items-center justify-between gap-2 p-3 text-sm">
          Include anime
          <input type="checkbox" checked={includeAnime} onChange={(e) => setIncludeAnime(e.target.checked)} className="h-5 w-5" />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="mr-card flex flex-col gap-1 p-3 text-sm">
          From year
          <input
            type="number" min={1900} max={2100} value={minYear}
            onChange={(e) => setMinYear(e.target.value)} placeholder="Any"
            className="bg-transparent font-semibold" aria-label="Earliest release year"
          />
        </label>
        <label className="mr-card flex flex-col gap-1 p-3 text-sm">
          To year
          <input
            type="number" min={1900} max={2100} value={maxYear}
            onChange={(e) => setMaxYear(e.target.value)} placeholder="Any"
            className="bg-transparent font-semibold" aria-label="Latest release year"
          />
        </label>
        <label className="mr-card flex flex-col gap-1 p-3 text-sm">
          Min provider score (0–10)
          <input
            type="number" min={0} max={10} step={0.5} value={minRating}
            onChange={(e) => setMinRating(e.target.value)} placeholder="Any"
            className="bg-transparent font-semibold" aria-label="Minimum provider score"
          />
        </label>
      </div>
      <p className="mt-2 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
        Score filter uses source-labelled provider scores; titles without one never match a floor.
      </p>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={roll}
          disabled={rolling}
          aria-label="Roll the dice"
          className={`mr-btn-gold inline-flex h-24 w-24 items-center justify-center rounded-full ${rolling ? "dice-rolling" : ""}`}
        >
          <DiceFive size={44} weight="regular" aria-hidden="true" />
        </button>
        <p className="mt-2 text-sm" role="status" style={{ color: "var(--mr-ink-soft)" }}>
          {rolling ? "Rolling…" : count > 0 ? `${count} matching title${count === 1 ? "" : "s"}` : "Tap the dice"}
        </p>
      </div>

      {empty && (
        <div className="mt-6">
          <EmptyState
            title="No titles match those filters"
            body="Loosen a filter — for example include anime or clear the runtime cap — and roll again."
            action={<Button variant="primary" onClick={clearAll}>Clear filters</Button>}
          />
        </div>
      )}

      {result && !empty && (
        <div className="mr-card mt-6 grid gap-4 p-4 sm:grid-cols-[160px_1fr]" aria-live="polite">
          <PosterArt title={result} />
          <div>
            <h2 className="font-display text-xl font-bold">{result.title}</h2>
            <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
              {[result.release_year, result.media_type, result.runtime_min ? `${result.runtime_min} min` : null].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {result.genres.map((g) => (
                <GenreChip key={g} label={g} />
              ))}
            </div>
            <p className="mt-2 text-sm">{result.synopsis}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => (window.location.href = `/title/${result.id}`)}>Watch this</Button>
              <Button variant="ghost" onClick={() => { setExcluded((e) => [...e, result.id]); setResult(null); }}>Not for me</Button>
              {me ? (
                <Button variant="ghost" onClick={() => api.watchlistAdd(result.id).then(() => push("Saved for later.")).catch(() => push("Couldn't save."))}>
                  Save for later
                </Button>
              ) : null}
              <Button variant="gold" onClick={roll}>Roll again</Button>
            </div>
            {!me && (
              <div className="mt-3">
                <AuthPrompt action="save this pick or tailor dice to your taste" returnTo="/dice" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

