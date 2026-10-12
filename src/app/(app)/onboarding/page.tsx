"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { AppBar } from "@/components/AppBar";
import type { Genre, Title } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/Button";
import { PosterArt } from "@/components/PosterArt";
import { MatureCover } from "@/components/MatureCover";
import { useToast } from "@/components/Toast";

export default function OnboardingPage() {
  const { me } = useAuth();
  const router = useRouter();
  const { push } = useToast();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [step, setStep] = useState<"genres" | "swipe" | "done">("genres");
  const [cards, setCards] = useState<Title[]>([]);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(0);
  const sessionKey = useState(() => `guest-${Math.random().toString(36).slice(2)}`)[0];

  useEffect(() => {
    api.genres().then(setGenres).catch(() => setGenres([]));
  }, []);

  const start = async () => {
    try {
      const recs = await api.onboarding(picked, true, 0, 5);
      setCards(recs.items);
      setIndex(0);
      setStep("swipe");
    } catch {
      push("Couldn't load recommendations. Try again.");
    }
  };

  const swipe = async (dir: "like" | "pass") => {
    const card = cards[index];
    if (!card) return;
    try {
      await api.swipe({ title_id: card.id, direction: dir, session_key: sessionKey });
    } catch {
      /* best-effort signal */
    }
    if (dir === "like") setLiked((n) => n + 1);
    if (index + 1 >= cards.length) {
      setStep("done");
      if (me) {
        try {
          await api.prefsPatch({ favourite_genres: picked });
          await api.patchMe({ onboarding_done: true });
        } catch {
          /* non-fatal */
        }
      }
    } else {
      setIndex((i) => i + 1);
    }
  };

  // Keyboard: arrows left/right
  useEffect(() => {
    if (step !== "swipe") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") swipe("pass");
      if (e.key === "ArrowRight") swipe("like");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, index, cards]);

  if (step === "genres") {
    return (
      <div className="mx-auto max-w-xl">
        <AppBar title="Taste setup" backFallback="/home" />
        <h1 className="font-display text-3xl font-extrabold">What do you love to watch?</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          Pick one or more genres — we&rsquo;ll pull five titles to swipe through. Five quick
          reactions give us a starting hint, not a full taste profile.
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Favourite genres">
          {genres.map((g) => {
            const on = picked.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked((p) => (on ? p.filter((x) => x !== g.id) : [...p, g.id]))}
                className="mr-chip px-4 py-2 text-sm"
                style={on ? { background: "var(--mr-plum)", color: "#fff" } : undefined}
              >
                {g.label}
                {g.is_anime_category ? " · anime" : ""}
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={start} disabled={picked.length === 0 && false}>
            {picked.length ? `Show me ${5} titles` : "Surprise me"}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/home")}>
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="mx-auto max-w-md">
        <AppBar title="Taste setup" backFallback="/home" />
        <div className="mr-card p-8 text-center">
          <h1 className="font-display text-2xl font-bold">Nice — you liked {liked} of {cards.length}.</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {me
              ? "Saved to your taste. We'll use it as a starting hint across Discover and Dice."
              : "Sign in to keep this taste and get sharper picks over time."}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => router.push("/discover")}>Explore Discover</Button>
            {!me && <Button variant="ghost" onClick={() => router.push("/profile?next=/onboarding")}>Sign in</Button>}
          </div>
        </div>
      </div>
    );
  }

  const card = cards[index];
  if (!card) return <p role="status">Loading your five…</p>;
  return (
    <div className="mx-auto max-w-sm">
      <AppBar title={`Swipe ${index + 1} of ${cards.length}`} backFallback="/home" />
      <h1 className="font-display text-2xl font-extrabold">Swipe the five</h1>
      <p className="text-sm" role="status" style={{ color: "var(--mr-ink-soft)" }}>
        {index + 1} of {cards.length} · arrow keys: left passes, right likes
      </p>
      <div className="mr-card mt-4 p-4" aria-live="polite">
        <MatureCover title={card}>
          <PosterArt title={card} />
        </MatureCover>
        <h2 className="font-display mt-3 text-xl font-bold">{card.title}</h2>
        <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          {[card.release_year, card.media_type, ...(card.genres.slice(0, 3))].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-2 line-clamp-3 text-sm">{card.synopsis}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="ghost" onClick={() => swipe("pass")} aria-label={`Pass on ${card.title}`}>
            <ArrowLeft size={18} weight="regular" aria-hidden="true" /> Pass
          </Button>
          <Button variant="gold" onClick={() => swipe("like")} aria-label={`Like ${card.title}`}>
            Like <ArrowRight size={18} weight="regular" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
