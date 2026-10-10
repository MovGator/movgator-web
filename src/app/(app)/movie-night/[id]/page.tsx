"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { DiceFive, EyeSlash, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { api, wsUrl, ApiError, type NightSnapshot } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AppBar } from "@/components/AppBar";
import type { Title } from "@/lib/types";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { EmptyState } from "@/components/Movie";
import { useToast } from "@/components/Toast";

type Conn = "connecting" | "live" | "retrying" | "offline";

function Room() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const { me } = useAuth();
  const { push } = useToast();
  const [snap, setSnap] = useState<NightSnapshot | null>(null);
  const [conn, setConn] = useState<Conn>("connecting");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [voter, setVoter] = useState("");
  const [guestKey, setGuestKey] = useState("");
  const [invite, setInvite] = useState(search.get("invite") ?? "");
  const [suggest, setSuggest] = useState("");
  const [results, setResults] = useState<Title[]>([]);
  const [searching, setSearching] = useState(false);
  const [myList, setMyList] = useState<Title[] | null>(null);
  const [showList, setShowList] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);

  const connect = useCallback(
    (voterKey: string, inv: string) => {
      wsRef.current?.close();
      setConn("connecting");
      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl(id, voterKey, inv));
      } catch {
        setConn("offline");
        return;
      }
      wsRef.current = ws;
      ws.onopen = () => {
        setConn("live");
        retryRef.current = 0;
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "snapshot" || msg.snapshot) setSnap(msg.snapshot);
          if (msg.type === "votes.updated" && msg.result?.winner) push("We have a winner!");
        } catch {
          /* ignore malformed */
        }
      };
      ws.onclose = () => {
        if (retryRef.current >= 5) {
          setConn("offline");
          return;
        }
        setConn("retrying");
        const backoff = Math.min(1000 * 2 ** retryRef.current, 15000);
        retryRef.current += 1;
        setTimeout(() => connect(voterKey, inv), backoff);
      };
      ws.onerror = () => ws.close();
    },
    [id, push]
  );

  useEffect(() => () => wsRef.current?.close(), []);

  const join = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    try {
      const r = await api.nightJoin(id, {
        display_name: name || me?.display_name || "Guest",
        invite,
        guest_key: "",
      });
      setVoter(r.voter_key);
      if (r.guest_key) {
        const raw = r.guest_key.startsWith("guest:") ? r.guest_key.slice(6) : r.guest_key;
        setGuestKey(raw);
        try {
          sessionStorage.setItem(`mr-night-${id}`, JSON.stringify({ invite, guestKey: raw }));
        } catch {
          /* private mode */
        }
      }
      setSnap(r.snapshot);
      setJoined(true);
      connect(r.voter_key, invite);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't join. Check the invite link.");
    }
  };

  const vote = async (candidate_id: string) => {
    try {
      await api.nightVote(id, candidate_id, guestKey);
      // Live broadcast carries the new snapshot; no local vote math.
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Vote failed.");
    }
  };

  const addTitle = async (title_id: string, title: string) => {
    try {
      await api.nightAddCandidate(id, title_id, guestKey);
      push(`“${title}” added to the shared shortlist.`);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't add that title.");
    }
  };

  const runSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!suggest.trim()) return;
    setSearching(true);
    try {
      const r = await api.search({ q: suggest.trim(), limit: 6 });
      setResults(r.items);
    } catch {
      push("Search failed — try again.");
    } finally {
      setSearching(false);
    }
  };

  const openWatchlist = async () => {
    if (myList) {
      setShowList((s) => !s);
      return;
    }
    try {
      setMyList(await api.watchlist());
      setShowList(true);
    } catch {
      push("Couldn't load your watchlist.");
    }
  };

  const tiebreak = async () => {
    try {
      const r = await api.nightTiebreak(id, guestKey);
      if (r.winner) push("Tie broken — winner decided.");
      else push("No tie to break.");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Tie-break failed.");
    }
  };

  if (!joined) {
    return (
      <div className="mr-card mx-auto max-w-md p-6">
        <h1 className="font-display text-2xl font-bold">Join Movie Night</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          This link invited you. Tell the room who you are —{me ? " you're signed in." : " no account needed."}
        </p>
        <form onSubmit={join} className="mt-4 flex flex-col gap-3">
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} placeholder={me?.display_name ?? "e.g. Ama"} maxLength={80} />
          <Input label="Invite token" value={invite} onChange={(e) => setInvite(e.target.value)} required />
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <div>
            <Button type="submit" variant="gold">
              Join the night
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const night = snap?.night;
  const decided = night?.status === "decided" || night?.status === "closed";
  const blind = !!night?.blind_voting && !decided;
  const winner = snap?.candidates.find((c) => night?.winner_title_id && c.id === night.winner_title_id);
  const prefs = (night?.prefs ?? {}) as Record<string, string | number | boolean | string[]>;
  const sched = night?.scheduled_at ? new Date(night.scheduled_at) : null;

  return (
    <div>
      <AppBar
        title={snap?.night.name ?? "Movie Night"}
        backFallback="/movie-night"
        actions={
          <span className="mr-chip px-2.5 py-1 text-xs font-bold" role="status">
            {conn === "live" ? "● Live" : conn === "retrying" ? "● …" : "○ Off"}
          </span>
        }
      />
      <div className="hidden flex-wrap items-center gap-3 md:flex">
        <h1 className="font-display text-2xl font-extrabold">{night?.name ?? "Movie Night"}</h1>
        <span className="mr-chip px-3 py-1 text-xs" role="status">
          {conn === "live" ? "● Live" : conn === "retrying" ? "● Reconnecting…" : conn === "offline" ? "○ Offline — retrying" : "● Connecting…"}
        </span>
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        Code {night?.code} · {snap?.members.length ?? 0} member{snap && snap.members.length === 1 ? "" : "s"}
        {snap ? ` · ${night?.total_votes ?? 0} vote${(night?.total_votes ?? 0) === 1 ? "" : "s"} cast` : ""}
        {sched ? ` · ${sched.toLocaleString()}` : ""}
        {night?.blind_voting ? " · blind vote" : ""}
      </p>
      {(prefs.genres || prefs.mood || prefs.max_runtime) && (
        <p className="mt-1 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
          Group prefers:{" "}
          {[
            Array.isArray(prefs.genres) ? prefs.genres.join(", ") : prefs.genres,
            typeof prefs.mood === "string" ? `${prefs.mood} mood` : null,
            prefs.max_runtime ? `under ${prefs.max_runtime} min` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {snap && (
        <p className="mt-1 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
          In the room: {snap.members.map((m) => m.display_name).join(", ") || "—"}
        </p>
      )}

      {winner && (
        <div className="mr-card mt-4 p-5 text-center" role="status">
          <h2 className="font-display text-xl font-bold">Tonight you&rsquo;re watching: {winner.title}</h2>
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Saved to this night&rsquo;s history — enjoy the show.
          </p>
        </div>
      )}

      <section aria-labelledby="shortlist" className="mt-6">
        <h2 id="shortlist" className="font-display text-xl font-bold">
          Shared shortlist ({snap?.candidates.length ?? 0})
        </h2>
        {blind && (
          <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
            <EyeSlash size={14} weight="regular" aria-hidden="true" />
            Blind vote — counts stay hidden until a winner is decided.
          </p>
        )}
        {snap && snap.candidates.length === 0 && (
          <div className="mt-3">
            <EmptyState
              title="No candidates yet"
              body="Search below to add the first title — it lands in the shared shortlist, never your personal watchlist."
            />
          </div>
        )}
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {snap?.candidates.map((c) => (
            <li key={c.candidate_id} className="mr-card flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-bold">{c.title}</p>
                <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
                  {blind ? "vote hidden" : `${c.votes} vote${c.votes === 1 ? "" : "s"}`}
                  {c.release_year ? ` · ${c.release_year}` : ""}
                </p>
              </div>
              {!decided && (
                <Button variant="primary" onClick={() => vote(c.candidate_id)}>
                  Vote
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {!decided && (
        <section aria-labelledby="add" className="mr-card mt-6 p-4">
          <h2 id="add" className="font-display text-lg font-bold">Step 3 — Suggest a title</h2>
          <form role="search" onSubmit={runSearch} className="mt-2 flex gap-2">
            <label htmlFor="night-search" className="sr-only">Search the catalogue to suggest</label>
            <input
              id="night-search"
              value={suggest}
              onChange={(e) => setSuggest(e.target.value)}
              placeholder="Search films and anime…"
              autoComplete="off"
              className="mr-card min-h-[44px] flex-1 px-4"
            />
            <button type="submit" className="mr-btn-primary inline-flex items-center gap-2 px-4" disabled={searching}>
              <MagnifyingGlass size={18} weight="regular" aria-hidden="true" />
              {searching ? "…" : "Find"}
            </button>
          </form>
          {results.length > 0 && (
            <ul className="mt-3 grid gap-2">
              {results.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">
                    <strong>{t.title}</strong>
                    <span style={{ color: "var(--mr-ink-soft)" }}>
                      {t.release_year ? ` (${t.release_year})` : ""}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => addTitle(t.id, t.title)}
                    aria-label={`Suggest ${t.title} for this night`}
                    className="mr-chip inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-semibold"
                  >
                    <Plus size={14} weight="regular" aria-hidden="true" /> Suggest
                  </button>
                </li>
              ))}
            </ul>
          )}
          {me ? (
            <div className="mt-3">
              <Button variant="ghost" onClick={openWatchlist} aria-expanded={showList}>
                {showList ? "Hide my watchlist" : "Pick from my watchlist"}
              </Button>
              {showList && (
                <ul className="mt-2 grid gap-2">
                  {(myList ?? []).map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate"><strong>{t.title}</strong></span>
                      <button
                        type="button"
                        onClick={() => addTitle(t.id, t.title)}
                        aria-label={`Suggest ${t.title} from your watchlist`}
                        className="mr-chip inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-semibold"
                      >
                        <Plus size={14} weight="regular" aria-hidden="true" /> Suggest
                      </button>
                    </li>
                  ))}
                  {myList !== null && myList.length === 0 && (
                    <li className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
                      Your watchlist is empty — suggesting copies titles here; your list stays yours.
                    </li>
                  )}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-3 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              Signed-in members can also pull from their watchlist. Suggesting copies a title
              into this shared shortlist — personal lists stay separate.
            </p>
          )}
        </section>
      )}

      {!decided && (snap?.candidates.length ?? 0) >= 2 && (
        <div className="mr-card mt-6 p-4">
          <h2 className="font-display text-lg font-bold">Step 5 — Stuck on a tie?</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Roll the server-side dice: one random pick among the tied leaders, decided and
            saved — never computed in your browser.
          </p>
          <div className="mt-3">
            <Button variant="gold" onClick={tiebreak}>
              <DiceFive size={18} weight="regular" aria-hidden="true" /> Break the tie
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              const s = await api.nightSnapshot(id, voter.startsWith("guest:") ? voter.slice(6) : "");
              setSnap(s);
              push("Synced latest state.");
            } catch {
              push("Sync failed — still retrying live connection.");
            }
          }}
        >
          Sync now
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href).then(() => push("Invite link copied.")).catch(() => push("Copy the page URL to invite."));
          }}
        >
          Copy invite link
        </Button>
      </div>
    </div>
  );
}

export default function NightRoomPage() {
  return (
    <Suspense fallback={<p role="status">Loading night…</p>}>
      <Room />
    </Suspense>
  );
}
