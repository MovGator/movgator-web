"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { AuthPrompt } from "@/components/AuthPrompt";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";

export function TitleActions({ id, title }: { id: string; title: string }) {
  const { me } = useAuth();
  const { push } = useToast();
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);

  const guard = async (fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(true);
    try {
      await fn();
      push(okMsg);
    } catch (e) {
      push(e instanceof ApiError ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      push("Link copied to clipboard.");
    } catch {
      push("Copy this page URL to share.");
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Your rating (1 to 5)">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setScore(s);
              if (me) guard(() => api.rate({ title_id: id, score: s, liked: s >= 4 }), `Rated ${s} of 5.`);
            }}
            aria-label={`Rate ${s} out of 5`}
            aria-pressed={score === s}
            className="mr-chip px-3 py-2 text-sm font-bold"
            style={score === s ? { background: "var(--mr-gold)", color: "#24102e" } : undefined}
          >
            {s}★
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          disabled={busy}
          onClick={() => me && guard(() => api.watchlistAdd(id), "Saved to your watchlist.")}
        >
          Save for later
        </Button>
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => me && guard(() => api.watchedAdd(id), "Marked as watched.")}
        >
          Mark watched
        </Button>
        <Button variant="ghost" onClick={share}>
          Share
        </Button>
      </div>
      {!me && <AuthPrompt action="save, rate or track this title" returnTo={`/title/${id}`} />}
    </div>
  );
}
