"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Star, Trash } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EmptyState, MovieCard } from "@/components/Movie";
import { Button } from "@/components/Button";
import { AppBar } from "@/components/AppBar";
import { Dialog } from "@/components/Dialog";
import { useToast } from "@/components/Toast";
import type { Title } from "@/lib/types";

export default function RatingsContent() {
  const { me, loading } = useAuth();
  const { push } = useToast();
  const [ratings, setRatings] = useState<{ title_id: string; score: number; liked: boolean; title?: Title }[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [sort, setSort] = useState<"score-desc" | "score-asc" | "liked">("score-desc");
  const [editing, setEditing] = useState<{ title_id: string; score: number; liked: boolean; title?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!me) return;
    api.ratings()
      .then(async (r) => {
        // Fetch title details for each rating
        const titles = await Promise.all(
          r.map(async (rating) => {
            try {
              const title = await api.title(rating.title_id);
              return { ...rating, title };
            } catch {
              return { ...rating, title: undefined };
            }
          })
        );
        setRatings(titles);
        setState("ok");
      })
      .catch(() => setState("error"));
  }, [me]);

  const handleDelete = async (titleId: string) => {
    try {
      await api.rate({ title_id: titleId, score: 0, liked: false });
      setRatings(prev => prev.filter(r => r.title_id !== titleId));
      push("Rating removed.");
    } catch {
      push("Couldn't remove rating.");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.rate({ title_id: editing.title_id, score: editing.score, liked: editing.liked });
      setRatings(prev => prev.map(r => r.title_id === editing.title_id ? { ...r, score: editing.score, liked: editing.liked } : r));
      push("Rating updated.");
      setEditing(null);
    } catch {
      push("Couldn't save rating.");
    } finally {
      setSaving(false);
    }
  };

  const visible = [...ratings].sort((a, b) => {
    if (sort === "score-asc") return a.score - b.score;
    if (sort === "liked") return Number(b.liked) - Number(a.liked) || b.score - a.score;
    return b.score - a.score;
  });

  if (loading) return <p role="status" className="p-8 text-center">Loading…</p>;
  if (!me) return <Link href={`/profile?next=/profile/ratings`}><p className="p-8 text-center">Please sign in</p></Link>;

  return (
    <div className="mx-auto max-w-3xl">
      <AppBar title="My Ratings" backFallback="/profile" />
      <h1 className="font-display mt-4 text-3xl font-extrabold">My Ratings</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        {ratings.length} rating{ratings.length === 1 ? "" : "s"} given
      </p>

      {state === "loading" && <p role="status" className="mt-4">Loading your ratings…</p>}
      {state === "error" && (
        <EmptyState
          title="Couldn't load ratings"
          body="Check your connection and try again."
          action={<Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>}
        />
      )}
      {state === "ok" && ratings.length === 0 && (
        <EmptyState
          title="No ratings yet"
          body="Rate any title from its page to build your list."
          action={<Link href="/discover"><Button variant="primary">Discover titles</Button></Link>}
        />
      )}
      {state === "ok" && ratings.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <label className="mr-chip flex items-center gap-2 px-3 py-1 text-sm">
              Sort
              <select aria-label="Sort ratings" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="bg-transparent font-semibold">
                <option value="score-desc">Highest first</option>
                <option value="score-asc">Lowest first</option>
                <option value="liked">Liked first</option>
              </select>
            </label>
          </div>
          <ul className="mt-4 flex flex-col gap-3" role="list">
          {visible.map((r) => (
            <li key={r.title_id} className="mr-card flex flex-col sm:flex-row gap-4 p-4">
              {r.title && (
                <Link href={`/title/${r.title.id}`} className="shrink-0 w-24 h-36 sm:w-20 sm:h-30" aria-label={r.title.title}>
                  <img
                    src={r.title.poster_url ?? "/brand/movgator-icon-logo-light.svg"}
                    alt=""
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                </Link>
              )}
              <div className="flex-1 min-w-0">
                {r.title ? (
                  <Link href={`/title/${r.title.id}`} className="font-semibold truncate block">{r.title.title}</Link>
                ) : (
                  <p className="font-semibold truncate">Title ID: {r.title_id.slice(0, 8)}…</p>
                )}
                <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
                  {r.title && [r.title.release_year, r.title.media_type === "anime" ? "Anime" : r.title.media_type === "series" ? "Series" : "Film"].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex items-center gap-1" aria-label={`Rating: ${r.score} out of 5`}>
                    <Star size={16} weight="fill" style={{ color: "var(--mr-gold)" }} aria-hidden="true" />
                    <span className="font-bold">{r.score.toFixed(1)}</span>
                  </span>
                  {r.liked && (
                    <span className="mr-chip px-2 py-0.5 text-xs" style={{ background: "var(--mr-gold)", color: "#24102e" }}>
                      Liked
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => setEditing({ title_id: r.title_id, score: r.score, liked: r.liked, title: r.title?.title })}>
                    <Star size={14} weight="regular" aria-hidden="true" />
                    Edit rating
                  </Button>
                  <Button variant="ghost" onClick={() => handleDelete(r.title_id)}>
                    <Trash size={14} weight="regular" aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        </>
      )}
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.title ? `Rate ${editing.title}` : "Edit rating"}>
        {editing && (
          <div className="space-y-4">
            <div className="flex gap-1" role="radiogroup" aria-label="Score">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={editing.score === s}
                  onClick={() => setEditing({ ...editing, score: s })}
                  aria-label={`${s} star${s === 1 ? "" : "s"}`}
                  className={`mr-chip px-3 py-2 font-bold ${editing.score === s ? "bg-[var(--mr-gold)] text-[#24102e]" : ""}`}
                >
                  {s}★
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.liked} onChange={(e) => setEditing({ ...editing, liked: e.target.checked })} className="h-5 w-5" />
              Liked it
            </label>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="primary" onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save rating"}</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}