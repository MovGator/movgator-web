"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DiceFive, EyeSlash, MagnifyingGlass, Plus, Trash, Copy } from "@phosphor-icons/react";
import { api, wsUrl, ApiError, req, type NightSnapshot, type NightMember } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AppBar } from "@/components/AppBar";
import type { Title } from "@/lib/types";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/Movie";
import { useToast } from "@/components/Toast";
import { Dialog } from "@/components/Dialog";

type Conn = "connecting" | "live" | "retrying" | "offline";
type Tab = "shortlist" | "members" | "invite" | "settings";

function inviteUrlFor(id: string, invite: string) {
  if (typeof window === "undefined") return `/movie-night/invitation/${id}?invite=${encodeURIComponent(invite)}`;
  return `${window.location.origin}/movie-night/invitation/${id}?invite=${encodeURIComponent(invite)}`;
}

function Room() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { me } = useAuth();
  const { push } = useToast();
  const [snap, setSnap] = useState<NightSnapshot | null>(null);
  const [conn, setConn] = useState<Conn>("connecting");
  const [joined, setJoined] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [voter, setVoter] = useState("");
  const [guestKey, setGuestKey] = useState("");
  const [invite, setInvite] = useState(search.get("invite") ?? "");
  const [suggest, setSuggest] = useState("");
  const [results, setResults] = useState<Title[]>([]);
  const [searching, setSearching] = useState(false);
  const [myList, setMyList] = useState<Title[] | null>(null);
  const [showList, setShowList] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("shortlist");
  const [members, setMembers] = useState<NightMember[]>([]);
  const [membersState, setMembersState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [rotating, setRotating] = useState(false);
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

  // Bootstrap: members open directly (host included); invitees go to the invitation page.
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setBootstrapping(true);
      let storedGuestKey = "";
      let effectiveInvite = invite;
      try {
        if (typeof sessionStorage !== "undefined") {
          try {
            const raw = sessionStorage.getItem(`mr-night-${id}`);
            if (raw) {
              const v = JSON.parse(raw);
              if (v.guestKey) {
                storedGuestKey = v.guestKey;
                setGuestKey(v.guestKey);
              }
              if (v.invite && !effectiveInvite) {
                effectiveInvite = v.invite;
                setInvite(v.invite);
              }
            }
          } catch {
            /* ignore */
          }
        }
        if (me) {
          try {
            const s = await api.nightSnapshot(id, effectiveInvite);
            if (cancelled) return;
            setSnap(s);
            setVoter(`user:${me.id}`);
            setJoined(true);
            connect(`user:${me.id}`, effectiveInvite);
            return;
          } catch {
            /* fall through to invitation redirect */
          }
        } else if (storedGuestKey) {
          try {
            const s = await api.nightSnapshot(id, storedGuestKey);
            if (cancelled) return;
            setSnap(s);
            setVoter(`guest:${storedGuestKey}`);
            setJoined(true);
            connect(`guest:${storedGuestKey}`, effectiveInvite);
            return;
          } catch {
            /* fall through to invitation redirect */
          }
        }
        if (effectiveInvite && !joined) {
          router.push(`/movie-night/invitation/${id}?invite=${encodeURIComponent(effectiveInvite)}`);
          return;
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [id, me, invite, joined, connect, router]);

  const loadMembers = useCallback(async () => {
    if (!snap || snap.night.owner_id !== me?.id) return;
    setMembersState("loading");
    try {
      const list = await api.nightMembers(id);
      setMembers(list);
      setMembersState("ok");
    } catch {
      setMembersState("error");
    }
  }, [id, me, snap]);

  useEffect(() => {
    if (activeTab === "members" && snap?.night.owner_id === me?.id) loadMembers();
  }, [activeTab, snap, me, loadMembers]);

  const removeMember = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      await api.nightRemoveMember(id, memberId);
      push("Member removed.");
      await loadMembers();
      try {
        const s = await api.nightSnapshot(id, invite);
        setSnap(s);
      } catch {
        /* keep existing snapshot */
      }
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't remove member.");
    } finally {
      setRemovingId(null);
    }
  };

  const leaveNight = async () => {
    setLeaving(true);
    try {
      await api.nightLeave(id, guestKey);
      try {
        sessionStorage.removeItem(`mr-night-${id}`);
      } catch {
        /* ignore */
      }
      push("You left the Movie Night.");
      router.push("/movie-night");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't leave the night.");
    } finally {
      setLeaving(false);
    }
  };

  const rotateInvite = async () => {
    setRotating(true);
    try {
      const r = await api.nightRotateInvite(id);
      const url = new URL(r.invite_url);
      const token = url.searchParams.get("invite") ?? r.invite;
      setInvite(token);
      try {
        const raw = sessionStorage.getItem(`mr-night-${id}`);
        const v = raw ? JSON.parse(raw) : {};
        sessionStorage.setItem(`mr-night-${id}`, JSON.stringify({ ...v, invite: token }));
      } catch {
        /* ignore */
      }
      push("Fresh invitation link generated.");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't rotate the invite.");
    } finally {
      setRotating(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard
      .writeText(inviteUrlFor(id, invite))
      .then(() => push("Invite link copied."))
      .catch(() => push("Copy the page URL to invite."));
  };

  const vote = async (candidate_id: string) => {
    try {
      await api.nightVote(id, candidate_id, guestKey);
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

  const deleteNight = async () => {
    try {
      await req(`/api/v1/movie-nights/${id}`, { method: "DELETE" });
      push("Movie Night deleted.");
      router.push("/movie-night");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't delete the night.");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (!joined) {
    if (bootstrapping) return <p role="status" className="p-8 text-center">Loading night…</p>;
    if (!invite) {
      return (
        <div className="mr-card mx-auto max-w-md p-6">
          <h1 className="font-display text-2xl font-bold">Join Movie Night</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            You need a valid invitation link to join this Movie Night.
          </p>
          <Link href="/movie-night" className="mt-4 block text-center">
            <Button variant="ghost">Back to Movie Nights</Button>
          </Link>
        </div>
      );
    }
    return (
      <div className="mr-card mx-auto max-w-md p-6">
        <h1 className="font-display text-2xl font-bold">Join Movie Night</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          Review the invitation first — you’ll accept it on the next screen.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link href={`/movie-night/invitation/${id}?invite=${encodeURIComponent(invite)}`}>
            <Button variant="gold">View invitation</Button>
          </Link>
          <Link href="/movie-night" className="text-center">
            <Button variant="ghost">Back to Movie Nights</Button>
          </Link>
        </div>
      </div>
    );
  }

  const night = snap?.night;
  const isHost = !!me && night?.owner_id === me.id;
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
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-extrabold">{night?.name ?? "Movie Night"}</h1>
        {isHost && <span className="mr-chip px-2 py-0.5 text-xs" style={{ background: "var(--mr-gold)", color: "#24102e" }}>Host</span>}
        {!isHost && <span className="mr-chip px-2 py-0.5 text-xs">Member</span>}
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        Code {night?.code} · {snap?.members.length ?? 0} member{snap && snap.members.length === 1 ? "" : "s"}
        {snap ? ` · ${night?.total_votes ?? 0} vote${(night?.total_votes ?? 0) === 1 ? "" : "s"} cast` : ""}
        {sched ? ` · ${sched.toLocaleString()}` : ""}
        {night?.blind_voting ? " · blind vote" : ""}
      </p>
      {snap?.night.owner_display_name && (
        <p className="mt-1 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
          Hosted by {snap.night.owner_display_name}
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

      <nav className="mt-6 mr-card p-1" aria-label="Movie Night sections">
        <div className="flex gap-1 overflow-x-auto" role="tablist">
          {(["shortlist", "members", "invite", ...(isHost ? ["settings" as const] : [])] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={activeTab === t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 mr-chip px-3 py-2 text-sm font-semibold capitalize ${activeTab === t ? "bg-[var(--mr-plum)] text-white" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === "shortlist" && (
        <div className="mt-4">
          <section aria-labelledby="shortlist">
            <h2 id="shortlist" className="font-display text-xl font-bold">
              Shared shortlist ({snap?.candidates.length ?? 0})
            </h2>
            {blind && (
              <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
                <EyeSlash size={14} weight="regular" aria-hidden="true" />
                Blind vote — counts hidden until a winner is decided.
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
              <h2 id="add" className="font-display text-lg font-bold">Suggest a title</h2>
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
                    </ul>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
                  Signed-in members can also pull from their watchlist.
                </p>
              )}
            </section>
          )}

          {!decided && (snap?.candidates.length ?? 0) >= 2 && (
            <div className="mr-card mt-6 p-4">
              <h2 className="font-display text-lg font-bold">Stuck on a tie?</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
                Roll the server-side dice among the tied leaders.
              </p>
              <div className="mt-3">
                <Button variant="gold" onClick={tiebreak}>
                  <DiceFive size={18} weight="regular" aria-hidden="true" /> Break the tie
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <section aria-labelledby="members" className="mt-4">
          <h2 id="members" className="font-display text-xl font-bold">Members ({snap?.members.length ?? 0})</h2>
          {!isHost && (
            <p className="mt-1 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              Only the host can remove members. You can leave the night below.
            </p>
          )}
          {isHost && membersState === "loading" && <p role="status" className="mt-3 text-sm">Loading members…</p>}
          {isHost && membersState === "error" && (
            <p className="mt-3 text-sm text-red-600">Couldn&rsquo;t load members. <button type="button" className="underline" onClick={loadMembers}>Retry</button></p>
          )}
          <ul className="mt-3 flex flex-col gap-2" role="list">
            {(isHost && membersState === "ok" ? members : []).map((m) => (
              <li key={m.id} className="mr-card flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-medium">{m.display_name} {m.is_host && <span className="mr-chip ml-1 px-1.5 py-0.5 text-xs" style={{ background: "var(--mr-gold)", color: "#24102e" }}>Host</span>}</p>
                  <p className="text-xs capitalize" style={{ color: "var(--mr-ink-soft)" }}>{m.kind}</p>
                </div>
                {!m.is_host && (
                  <Button variant="ghost" onClick={() => removeMember(m.id)} disabled={removingId === m.id}>
                    <Trash size={16} weight="regular" aria-hidden="true" /> {removingId === m.id ? "Removing…" : "Remove"}
                  </Button>
                )}
              </li>
            ))}
            {(!isHost || membersState !== "ok") && snap?.members.map((m) => (
              <li key={`${m.kind}-${m.display_name}`} className="mr-card flex items-center justify-between gap-3 p-3">
                <p className="font-medium">{m.display_name}</p>
                <span className="text-xs capitalize" style={{ color: "var(--mr-ink-soft)" }}>{m.kind}{m.is_host ? " · host" : ""}</span>
              </li>
            ))}
          </ul>
          {!isHost && (
            <div className="mt-4">
              <Button variant="ghost" onClick={leaveNight} disabled={leaving}>
                {leaving ? "Leaving…" : "Leave this Movie Night"}
              </Button>
            </div>
          )}
        </section>
      )}

      {activeTab === "invite" && (
        <section aria-labelledby="invite" className="mt-4">
          <h2 id="invite" className="font-display text-xl font-bold mb-3">Invite members</h2>
          <div className="mr-card p-5 space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="invite-link" className="text-sm font-medium">Shareable invitation link</label>
              <div className="flex gap-2">
                <input id="invite-link" readOnly value={inviteUrlFor(id, invite)} className="mr-card min-h-[44px] flex-1 px-3 text-sm" />
                <Button variant="ghost" onClick={copyInviteLink} aria-label="Copy invitation link">
                  <Copy size={18} weight="regular" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setShowQR(true)}>Show QR code</Button>
              {isHost && (
                <Button variant="ghost" onClick={rotateInvite} disabled={rotating}>
                  {rotating ? "Rotating…" : "Generate fresh link"}
                </Button>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              Anyone with the link reviews the invitation and chooses Accept or Decline. No tokens to type.
            </p>
          </div>
          <Dialog open={showQR} onClose={() => setShowQR(false)} title="Invitation QR code">
            <div className="text-center">
              <div className="inline-block bg-white p-3 rounded">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteUrlFor(id, invite))}`}
                  alt="Movie Night invitation QR code"
                  width={220}
                  height={220}
                />
              </div>
              <p className="mt-3 text-xs" style={{ color: "var(--mr-ink-soft)" }}>Scan to open this invitation.</p>
            </div>
          </Dialog>
        </section>
      )}

      {activeTab === "settings" && isHost && (
        <section aria-labelledby="night-settings" className="mt-4">
          <h2 id="night-settings" className="font-display text-xl font-bold mb-3">Host settings</h2>
          <div className="mr-card p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    const s = await api.nightSnapshot(id, voter.startsWith("guest:") ? voter.slice(6) : invite);
                    setSnap(s);
                    push("Synced latest state.");
                  } catch {
                    push("Sync failed — still retrying live connection.");
                  }
                }}
              >
                Sync now
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                <Trash size={16} weight="regular" aria-hidden="true" /> Delete night
              </Button>
            </div>
            <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              Deleting removes members, candidates, and votes. This cannot be undone.
            </p>
          </div>
          <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Movie Night">
            <p className="text-sm">Permanently delete “{night?.name}” and all its data?</p>
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={deleteNight}>Delete</Button>
            </div>
          </Dialog>
        </section>
      )}

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
