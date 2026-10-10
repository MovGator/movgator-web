"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/Logo";
import { MovieCard, EmptyState } from "@/components/Movie";
import { Dialog } from "@/components/Dialog";
import { AppBar } from "@/components/AppBar";
import { InstallCard } from "@/components/InstallPrompt";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import type { Title } from "@/lib/types";

function SignIn({ next, onDone }: { next: string; onDone: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await api.login({ email, password });
      else await api.register({ email, password, display_name: name || "Movie fan" });
      onDone();
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      const { url } = await api.googleUrl();
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === "oauth_not_configured"
          ? "Google sign-in isn't configured on this server yet — use email instead. (Admin: set GOOGLE_CLIENT_ID/SECRET.)"
          : "Google sign-in failed. Try email instead."
      );
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <AppBar title="Profile" showBack={false} brand />
      <div className="mr-card p-6">
      <Logo height={34} />
      <h1 className="font-display mt-3 text-2xl font-bold">Your MovGator account</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        Watchlist, ratings, onboarding taste and Movie Nights sync here. Browsing stays open to everyone.
      </p>
      <div className="mt-4 flex gap-2" role="tablist" aria-label="Sign in or create account">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className="mr-chip px-4 py-2 text-sm font-semibold"
            style={mode === m ? { background: "var(--mr-plum)", color: "#fff" } : undefined}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        {mode === "register" && <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {mode === "register" && (
          <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
            At least 8 characters with letters and numbers.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <div className="mt-3">
        <Button variant="ghost" onClick={google} className="w-full">
          Continue with Google
        </Button>
      </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { me, refresh, signOut } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<Title[]>([]);
  const [ratings, setRatings] = useState<{ title_id: string; score: number; liked: boolean }[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(me?.display_name ?? "");

  useEffect(() => {
    api.watchlist().then(setWatchlist).catch(() => {});
    api.ratings().then(setRatings).catch(() => {});
  }, []);

  if (!me) return null;
  return (
    <div className="mx-auto max-w-3xl">
      <AppBar title="Profile" showBack={false} brand />
      <div className="mr-card flex items-center gap-4 p-5">
        <Avatar name={me.display_name} url={me.avatar_url} size={72} />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{me.display_name}</h1>
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {me.email} · {me.email_verified ? "verified" : "unverified"}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
            router.push("/home");
          }}
        >
          Log out
        </Button>
      </div>

      <section aria-labelledby="wl" className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 id="wl" className="font-display text-xl font-bold">
            Watchlist ({watchlist.length})
          </h2>
          <Link href="/watchlist" className="text-sm font-semibold underline">
            Open full list
          </Link>
        </div>
        {watchlist.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="Nothing saved yet" body="Tap “Save for later” on any title to build your list." />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {watchlist.map((t) => (
              <MovieCard key={t.id} title={t} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="rt" className="mt-8">
        <h2 id="rt" className="font-display text-xl font-bold">
          Your ratings ({ratings.length})
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {ratings.map((r) => (
            <li key={r.title_id} className="mr-card flex justify-between px-4 py-2">
              <span className="font-mono text-xs">{r.title_id.slice(0, 8)}…</span>
              <span aria-label={`Rated ${r.score} out of 5`}>{r.score} / 5{ r.liked ? " · liked" : ""}</span>
            </li>
          ))}
          {ratings.length === 0 && <li style={{ color: "var(--mr-ink-soft)" }}>No ratings yet — rate any title from its page.</li>}
        </ul>
      </section>

      <section aria-labelledby="set" className="mr-card mt-8 p-5">
        <h2 id="set" className="font-display text-xl font-bold">Settings</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm">Appearance</span>
          <ThemeToggle />
        </div>
        <div className="mt-3">
          <InstallCard compact />
        </div>
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.patchMe({ display_name: name });
              await refresh();
              push("Profile updated.");
            } catch {
              push("Couldn't save settings.");
            }
          }}
        >
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          <div>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
        <div className="mt-4">
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete account
          </Button>
        </div>
      </section>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your account?">
        <p className="text-sm">This permanently removes your profile, watchlist, ratings and nights. This can&rsquo;t be undone.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Keep my account</Button>
          <Button
            variant="danger"
            onClick={async () => {
              await api.deleteMe();
              await signOut();
              router.push("/");
            }}
          >
            Delete everything
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function ProfileInner() {
  const { me, loading, refresh } = useAuth();
  const params = useSearchParams();
  const next = params.get("next") ?? "/home";
  if (loading) return <p role="status">Loading…</p>;
  return me ? <Dashboard /> : <SignIn next={next} onDone={refresh} />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<p role="status">Loading…</p>}>
      <ProfileInner />
    </Suspense>
  );
}
