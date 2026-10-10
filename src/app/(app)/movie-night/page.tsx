"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, EyeSlash } from "@phosphor-icons/react";
import { api, ApiError, type NightHistory } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { MOODS } from "@/lib/moods";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/Movie";
import { AppBar } from "@/components/AppBar";
import { useToast } from "@/components/Toast";

/** Guest nights are keyed by stored guest keys (sessionStorage mr-night-*). */
function storedGuestKeys(): string[] {
  if (typeof sessionStorage === "undefined") return [];
  const keys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (k?.startsWith("mr-night-")) {
      try {
        const v = JSON.parse(sessionStorage.getItem(k) ?? "{}");
        if (v.guestKey) keys.push(v.guestKey);
      } catch {
        /* ignore malformed */
      }
    }
  }
  return keys;
}

export default function MovieNightIndex() {
  const router = useRouter();
  const { me } = useAuth();
  const { push } = useToast();
  const [name, setName] = useState("Friday Movie Night");
  const [when, setWhen] = useState("");
  const [blind, setBlind] = useState(false);
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [maxRuntime, setMaxRuntime] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<NightHistory[] | null>(null);

  useEffect(() => {
    api
      .nightMine(typeof sessionStorage === "undefined" ? [] : storedGuestKeys())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [me]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const n = await api.nightCreate({
        name,
        scheduled_at: when ? new Date(when).toISOString() : null,
        blind_voting: blind,
        prefs: {
          ...(genre ? { genres: [genre] } : {}),
          ...(mood ? { mood } : {}),
          ...(maxRuntime ? { max_runtime: Number(maxRuntime) } : {}),
        },
      });
      const invite = n.invite_url ? new URL(n.invite_url).searchParams.get("invite") ?? "" : "";
      try {
        sessionStorage.setItem(`mr-night-${n.id}`, JSON.stringify({ invite, voter: "" }));
      } catch {
        /* private mode */
      }
      push("Night created — share the invite link.");
      router.push(`/movie-night/${n.id}${invite ? `?invite=${encodeURIComponent(invite)}` : ""}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the night. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <AppBar title="Movie Night" showBack={false} brand />
      <h1 className="font-display text-3xl font-extrabold">Movie Night</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        Name it, pick a time, invite with a link, build a shared shortlist and vote
        live. Guests join free — private sessions stay private to invited members.
      </p>

      <form onSubmit={create} className="mr-card mt-6 flex flex-col gap-3 p-5">
        <h2 className="font-display text-lg font-bold">Step 1 — Create your night</h2>
        <Input label="Night name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
        <label className="flex flex-col gap-1 text-sm font-medium">
          Date and time (optional)
          <span className="mr-card flex min-h-[44px] items-center gap-2 px-3">
            <CalendarPlus size={18} weight="regular" aria-hidden="true" />
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              aria-label="Night date and time (optional)"
              className="w-full bg-transparent py-2 text-base"
            />
          </span>
        </label>
        <fieldset>
          <legend className="text-sm font-medium">Group preferences (guide the shortlist)</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <label className="mr-chip flex items-center gap-2 px-3 py-2">
              Genre
              <select aria-label="Preferred genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="bg-transparent font-semibold">
                <option value="">Any</option>
                <option value="action">Action</option>
                <option value="adventure">Adventure</option>
                <option value="animation">Animation</option>
                <option value="anime">Anime</option>
                <option value="comedy">Comedy</option>
                <option value="crime">Crime</option>
                <option value="drama">Drama</option>
                <option value="fantasy">Fantasy</option>
                <option value="horror">Horror</option>
                <option value="mystery">Mystery</option>
                <option value="romance">Romance</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="thriller">Thriller</option>
              </select>
            </label>
            <label className="mr-chip flex items-center gap-2 px-3 py-2">
              Mood
              <select aria-label="Preferred mood" value={mood} onChange={(e) => setMood(e.target.value)} className="bg-transparent font-semibold">
                <option value="">Any</option>
                {MOODS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="mr-chip mt-2 flex items-center gap-2 px-3 py-2 text-sm">
            Max runtime (min)
            <input
              type="number" min={20} max={400} value={maxRuntime}
              onChange={(e) => setMaxRuntime(e.target.value)} placeholder="Any"
              className="w-24 bg-transparent font-semibold" aria-label="Maximum runtime in minutes"
            />
          </label>
        </fieldset>
        <label className="mr-card flex items-start gap-2 p-3 text-sm">
          <input type="checkbox" checked={blind} onChange={(e) => setBlind(e.target.checked)} className="mt-1 h-5 w-5" />
          <span>
            <span className="inline-flex items-center gap-1 font-semibold">
              <EyeSlash size={16} weight="regular" aria-hidden="true" /> Blind voting
            </span>
            <br />
            <span style={{ color: "var(--mr-ink-soft)" }}>
              Hide vote counts until a winner is decided. Participation totals stay visible.
            </span>
          </span>
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <div>
          <Button type="submit" variant="gold" disabled={busy}>
            {busy ? "Creating…" : "Step 2 — Create & get invite link"}
          </Button>
        </div>
      </form>

      <section aria-labelledby="history" className="mt-8">
        <h2 id="history" className="font-display text-xl font-bold">Your nights</h2>
        {history === null && <p role="status" className="mt-2 text-sm">Loading history…</p>}
        {history !== null && history.length === 0 && (
          <div className="mt-3">
            <EmptyState
              title="No nights yet"
              body="Create your first night above, or open an invite link to join one."
            />
          </div>
        )}
        {history !== null && history.length > 0 && (
          <ul className="mt-3 grid gap-2">
            {history.map((n) => (
              <li key={n.id} className="mr-card flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold">{n.name}</p>
                  <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
                    {n.status}
                    {n.scheduled_at ? ` · ${new Date(n.scheduled_at).toLocaleString()}` : ""}
                    {` · ${n.member_count} member${n.member_count === 1 ? "" : "s"} · ${n.candidate_count} shortlisted`}
                  </p>
                </div>
                <Link href={`/movie-night/${n.id}`} className="mr-chip px-4 py-2 text-sm font-semibold">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
