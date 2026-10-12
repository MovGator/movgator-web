"use client";
import { useEffect, useState } from "react";
import { DiceFive } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { MOODS } from "@/lib/moods";
import type { Genre, Title } from "@/lib/types";
import { EmptyState, GenreChip } from "@/components/Movie";
import { MatureCover } from "@/components/MatureCover";
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

  // UI state for collapsible sections
  const [showGenres, setShowGenres] = useState(true);
  const [showMood, setShowMood] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    api.genres().then(setGenres).catch(() => setGenres([]));
  }, []);
  // Mood maps onto real genre slugs; explicit genre picks take precedence.
  const moodGenres = MOODS.find((m) => m.id === mood)?.genres ?? [];
  const activeGenres = picked.length ? picked : moodGenres;

  const clearAll = () => {
    setPicked([]);
    setMood("");
    setMedia("");
    setMaxRuntime("");
    setMinYear("");
    setMaxYear("");
    setMinRating("");
    setIncludeAnime(true);
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

      {/* Main Dice Action - Always Visible */}
      <section className="mt-6" aria-labelledby="dice-action">
        <h2 id="dice-action" className="sr-only">Roll the Dice</h2>
        <div className="text-center">
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
      </section>

      {/* Result Display */}
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
          <MatureCover title={result}>
            <PosterArt title={result} />
          </MatureCover>
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

      {/* Collapsible Filter Sections */}
      <section className="mt-8" aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">Filters</h2>
        
        {/* Quick Filter Toggles */}
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Quick filter toggles">
          <button
            type="button"
            onClick={() => setShowGenres(!showGenres)}
            className={`mr-chip px-4 py-2 text-sm font-semibold flex items-center gap-2 ${showGenres ? "bg-[var(--mr-plum)] text-white" : ""}`}
            aria-expanded={showGenres}
            aria-controls="genre-panel"
          >
            <span>Genres</span>
            <span className={`transition-transform ${showGenres ? "rotate-180" : ""}`}>
              <span className="inline-block transition-transform duration-200" style={{ display: "inline-block" }}>
                ▼
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowMood(!showMood)}
            className={`mr-chip px-4 py-2 text-sm font-semibold flex items-center gap-2 ${showMood ? "bg-[var(--mr-plum)] text-white" : ""}`}
            aria-expanded={showMood}
            aria-controls="mood-panel"
          >
            <span>Mood</span>
            <span className={`transition-transform ${showMood ? "rotate-180" : ""}`}>
              <span className="inline-block transition-transform duration-200" style={{ display: "inline-block" }}>
                ▼
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`mr-chip px-4 py-2 text-sm font-semibold flex items-center gap-2 ${showAdvanced ? "bg-[var(--mr-plum)] text-white" : ""}`}
            aria-expanded={showAdvanced}
            aria-controls="advanced-panel"
          >
            <span>Advanced</span>
            <span className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}>
              <span className="inline-block transition-transform duration-200" style={{ display: "inline-block" }}>
                ▼
              </span>
            </span>
          </button>
        </div>

        {/* Genre Panel */}
        <div id="genre-panel" className={`overflow-hidden transition-all duration-300 ${showGenres ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`} role="region" aria-label="Genre filters">
          <fieldset className="mr-card p-4">
            <legend className="text-sm font-semibold mb-3">Genres (max 5)</legend>
            <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Mood Panel */}
        <div id="mood-panel" className={`overflow-hidden transition-all duration-300 ${showMood ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`} role="region" aria-label="Mood filters">
          <fieldset className="mr-card p-4">
            <legend className="text-sm font-semibold mb-3">Mood <span className="font-normal text-xs" style={{ color: "var(--mr-ink-soft)" }}>(maps to genres)</span></legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setMood("")} className="mr-chip px-3 py-1.5 text-sm" aria-pressed={!mood}>
                Any mood
              </button>
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(mood === m.id ? "" : m.id)}
                  className="mr-chip px-3 py-1.5 text-sm"
                  aria-pressed={mood === m.id}
                  title={`Shows ${m.genres.join(", ")} titles`}
                  style={mood === m.id ? { background: "var(--mr-plum)", color: "#fff", borderColor: "transparent" } : undefined}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Advanced Filters Panel */}
        <div id="advanced-panel" className={`overflow-hidden transition-all duration-300 ${showAdvanced ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`} role="region" aria-label="Advanced filters">
          <div className="mr-card p-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
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
                  onChange={(e) => setMaxRuntime(e.target.value)} placeholder="Any"
                  className="bg-transparent font-semibold"
                />
              </label>
              <label className="mr-card flex items-center justify-between gap-2 p-3 text-sm">
                Include anime
                <input type="checkbox" checked={includeAnime} onChange={(e) => setIncludeAnime(e.target.checked)} className="h-5 w-5" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
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
            <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              Score filter uses source-labelled provider scores; titles without one never match a floor.
            </p>
          </div>
        </div>
      </section>

      {/* Clear Filters */}
      {(picked.length || mood || media || !includeAnime || maxRuntime || minYear || maxYear || minRating) && (
        <div className="mt-4">
          <Button variant="ghost" onClick={clearAll} className="w-full sm:w-auto">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}