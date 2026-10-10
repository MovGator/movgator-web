"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Title } from "@/lib/types";
import { EmptyState, MovieCard } from "@/components/Movie";
import { Button } from "@/components/Button";
import { AppBar } from "@/components/AppBar";

export default function WatchlistPage() {
  const { me, loading } = useAuth();
  const [items, setItems] = useState<Title[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

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
        {state === "ok" ? `${items.length} saved · yours alone — nights keep their own shortlists` : " "}
      </p>
      {state === "loading" && <p role="status">Loading your list…</p>}
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
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((t) => (
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
    </div>
  );
}
