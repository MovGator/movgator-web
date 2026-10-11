"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Star, Trash } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EmptyState, MovieCard } from "@/components/Movie";
import { Button } from "@/components/Button";
import { AppBar } from "@/components/AppBar";
import { useToast } from "@/components/Toast";
import type { Title } from "@/lib/types";

export default function RatingsContent() {
  const { me, loading } = useAuth();
  const { push } = useToast();
  const [ratings, setRatings] = useState<{ title_id: string; score: number; liked: boolean; title?: Title }[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

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
        <ul className="mt-4 flex flex-col gap-3" role="list">
          {ratings.map((r) => (
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
                <p className="mt-2 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
                  <Button variant="ghost" onClick={() => handleDelete(r.title_id)}>
                    <Trash size={14} weight="regular" aria-hidden="true" />
                    Remove
                  </Button>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}