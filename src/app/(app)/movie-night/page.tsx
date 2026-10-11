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
import { QrScanner, parseInviteLink } from "@/components/QrScanner";

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

function NightRow({ night, hrefLabel = "Open" }: { night: NightHistory; hrefLabel?: string }) {
  return (
    <li className="mr-card flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="font-bold truncate">
          {night.name} {night.is_host && <span className="mr-chip ml-1 px-1.5 py-0.5 text-xs" style={{ background: "var(--mr-gold)", color: "#24102e" }}>Host</span>}
        </p>
        <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
          {night.status}
          {night.scheduled_at ? ` · ${new Date(night.scheduled_at).toLocaleString()}` : ""}
          {` · ${night.member_count} member${night.member_count === 1 ? "" : "s"} · ${night.candidate_count} shortlisted`}
        </p>
      </div>
      <Link href={`/movie-night/${night.id}`} className="mr-chip px-4 py-2 text-sm font-semibold shrink-0">
        {hrefLabel}
      </Link>
    </li>
  );
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
  const [showPrefs, setShowPrefs] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteError, setInviteError] = useState("");

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
      push("Night created — you’re the host. Share the invite link from inside.");
      router.push(`/movie-night/${n.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the night. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const openInviteLink = (raw: string) => {
    setInviteError("");
    const target = parseInviteLink(raw);
    if (!target) {
      setInviteError("That doesn't look like a Movie Night invitation link.");
      return;
    }
    router.push(`/movie-night/invitation/${target.id}?invite=${encodeURIComponent(target.invite)}`);
  };

  const hosted = (history ?? []).filter((n) => n.is_host);
  const joined = (history ?? []).filter((n) => !n.is_host);

  return (
    <div className="mx-auto max-w-3xl">
      <AppBar title="Movie Night" showBack={false} brand />
      <h1 className="font-display text-3xl font-extrabold">Movie Night</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        Host a night, or join one with a link. Hosts manage members and voting; members nominate and vote.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <form onSubmit={create} className="mr-card flex flex-col gap-3 p-5">
          <h2 className="font-display text-lg font-bold">Create a night</h2>
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
          <button type="button" onClick={() => setShowPrefs((s) => !s)} className="mr-chip px-3 py-2 text-sm text-left" aria-expanded={showPrefs}>
            Group preferences {showPrefs ? "▾" : "▸"}
          </button>
          {showPrefs && (
            <fieldset>
              <legend className="sr-only">Group preferences</legend>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="mr-chip flex items-center gap-2 px-3 py-2">
                  Genre
                  <select aria-label="Preferred genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="bg-transparent font-semibold">
                    <option value="">Any</option>
                    {["action", "adventure", "animation", "anime", "comedy", "crime", "drama", "fantasy", "horror", "mystery", "romance", "sci-fi", "thriller"].map((g) => (
                      <option key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</option>
                    ))}
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
          )}
          <label className="mr-card flex items-start gap-2 p-3 text-sm">
            <input type="checkbox" checked={blind} onChange={(e) => setBlind(e.target.checked)} className="mt-1 h-5 w-5" />
            <span>
              <span className="inline-flex items-center gap-1 font-semibold">
                <EyeSlash size={16} weight="regular" aria-hidden="true" /> Blind voting
              </span>
              <br />
              <span style={{ color: "var(--mr-ink-soft)" }}>Hide counts until a winner is decided.</span>
            </span>
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="gold" disabled={busy}>
            {busy ? "Creating…" : "Create night"}
          </Button>
        </form>

        <section aria-labelledby="join-night" className="mr-card flex flex-col gap-3 p-5">
          <h2 id="join-night" className="font-display text-lg font-bold">Join with an invite</h2>
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Paste an invitation link or scan its QR code. You’ll review it before accepting.
          </p>
          <QrScanner onDetected={(t) => router.push(`/movie-night/invitation/${t.id}?invite=${encodeURIComponent(t.invite)}`)} />
          <label htmlFor="invite-link-input" className="text-sm font-medium">Invitation link</label>
          <input
            id="invite-link-input"
            value={inviteLink}
            onChange={(e) => setInviteLink(e.target.value)}
            placeholder="https://…/movie-night/…?invite=…"
            autoComplete="off"
            className="mr-card min-h-[44px] px-3 text-sm"
          />
          {inviteError && <p role="alert" className="text-sm text-red-600">{inviteError}</p>}
          <Button variant="primary" onClick={() => openInviteLink(inviteLink)} disabled={!inviteLink.trim()}>
            Open invitation
          </Button>
        </section>
      </div>

      <section aria-labelledby="hosted" className="mt-8">
        <h2 id="hosted" className="font-display text-xl font-bold">Hosted by you</h2>
        {history === null && <p role="status" className="mt-2 text-sm">Loading history…</p>}
        {history !== null && hosted.length === 0 && (
          <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>No hosted nights yet — create one above.</p>
        )}
        {hosted.length > 0 && (
          <ul className="mt-3 grid gap-2">
            {hosted.map((n) => <NightRow key={n.id} night={n} hrefLabel="Manage" />)}
          </ul>
        )}
      </section>

      <section aria-labelledby="joined" className="mt-8">
        <h2 id="joined" className="font-display text-xl font-bold">Joined nights</h2>
        {history === null && <p role="status" className="mt-2 text-sm">Loading history…</p>}
        {history !== null && joined.length === 0 && (
          <div className="mt-3">
            <EmptyState title="No joined nights yet" body="Open an invite link above to join a friend’s night." />
          </div>
        )}
        {joined.length > 0 && (
          <ul className="mt-3 grid gap-2">
            {joined.map((n) => <NightRow key={n.id} night={n} />)}
          </ul>
        )}
      </section>
    </div>
  );
}
