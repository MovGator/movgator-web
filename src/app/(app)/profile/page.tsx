"use client";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/Logo";
import { Dialog } from "@/components/Dialog";
import { AppBar } from "@/components/AppBar";
import { InstallCard } from "@/components/InstallPrompt";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import type { Title } from "@/lib/types";

const PALETTES = ["violet", "mint", "peach", "sky", "rose", "sand", "mono", "auto"] as const;
const MOODS = ["happy", "chill", "brave", "dreamy", "wild"] as const;
const TILE_BGS = ["auto", "#070209", "#f7f6f8", "#3b1f4a", "#f5a623"] as const;

function ForgotPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { push } = useToast();
  const resetTokenRef = useRef<string | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.forgotPasswordRequest(email);
      push("If that email exists, a code has been sent.");
      setStep("verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send code.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api.forgotPasswordVerify(email, code);
      resetTokenRef.current = res.reset_token;
      setStep("reset");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired code.");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!resetTokenRef.current) {
      setError("Session expired. Please start over.");
      setStep("request");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.forgotPasswordReset(resetTokenRef.current, password);
      push("Password reset. You can now sign in.");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reset password.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Reset your password" maxWidth="max-w-md">
      {step === "request" && (
        <form onSubmit={handleRequest} className="space-y-3">
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Enter your email and we&rsquo;ll send a 6-digit code.
          </p>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy} className="flex-1">{busy ? "Sending…" : "Send code"}</Button>
          </div>
        </form>
      )}
      {step === "verify" && (
        <form onSubmit={handleVerify} className="space-y-3">
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Enter the 6-digit code sent to <strong>{email}</strong>.
          </p>
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} pattern="[0-9]*" inputMode="numeric" required autoComplete="one-time-code" />
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => { setStep("request"); setError(""); }}>Back</Button>
            <Button type="submit" disabled={busy} className="flex-1">{busy ? "Verifying…" : "Verify code"}</Button>
          </div>
        </form>
      )}
      {step === "reset" && (
        <form onSubmit={handleReset} className="space-y-3">
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>Set your new password.</p>
          <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
          <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>At least 8 characters with letters and numbers.</p>
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => { setStep("verify"); setError(""); }}>Back</Button>
            <Button type="submit" disabled={busy} className="flex-1">{busy ? "Resetting…" : "Reset password"}</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

function SignIn({ next, onDone }: { next: string; onDone: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
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
      const { url } = await api.googleUrl(next);
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
          {mode === "login" && (
            <div className="text-right">
              <Button variant="ghost" type="button" onClick={() => setForgotOpen(true)} className="text-xs px-3 py-1">
                Forgot password?
              </Button>
            </div>
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
      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}

function AvatarPickerDialog({
  open,
  onClose,
  currentSeed,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  currentSeed: string | null | undefined;
  onSave: (seed: string) => void;
}) {
  const [seed, setSeed] = useState(currentSeed || "");
  const [palette, setPalette] = useState<typeof PALETTES[number]>("violet");
  const [mood, setMood] = useState<typeof MOODS[number]>("happy");
  const [tileBg, setTileBg] = useState<typeof TILE_BGS[number]>("auto");
  const [animated, setAnimated] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (open) {
      setSeed(currentSeed || "");
      updatePreview();
    }
  }, [open, currentSeed]);

  const updatePreview = () => {
    if (!seed) return;
    const params = new URLSearchParams({
      size: "128",
      palette,
      mood,
      tileBg,
      animated: animated ? "1" : "0",
    });
    setPreviewUrl(`https://api.navii.dev/avatar/${encodeURIComponent(seed)}.png?${params.toString()}`);
  };

  useEffect(() => {
    updatePreview();
  }, [seed, palette, mood, tileBg, animated]);

  const handleSave = async () => {
    if (!seed.trim()) return;
    setBusy(true);
    try {
      await onSave(seed.trim());
      push("Avatar updated!");
      onClose();
    } catch {
      push("Failed to update avatar. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const randomize = () => {
    const newSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSeed(newSeed);
    setPalette(PALETTES[Math.floor(Math.random() * PALETTES.length)]);
    setMood(MOODS[Math.floor(Math.random() * MOODS.length)]);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Customize your avatar" maxWidth="max-w-3xl">
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="flex flex-col items-center gap-4">
          <Avatar name="Preview" url={previewUrl} size={128} />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={randomize} disabled={busy}>
              Randomize
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={busy || !seed.trim()}>
              {busy ? "Saving…" : "Save avatar"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              label="Seed (your unique ID)"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Enter a seed (alphanumeric, -, _)"
              maxLength={64}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              This determines your base avatar. Same seed = same avatar.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Palette</label>
            <div className="flex flex-wrap gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPalette(p)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${palette === p ? "ring-2 ring-offset-2" : ""}`}
                  style={{
                    background: palette === p ? "var(--mr-plum)" : "var(--mr-surface-2)",
                    color: palette === p ? "#fff" : "var(--mr-ink)",
                    borderColor: palette === p ? "var(--mr-plum)" : "var(--mr-line)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${mood === m ? "ring-2 ring-offset-2" : ""}`}
                  style={{
                    background: mood === m ? "var(--mr-plum)" : "var(--mr-surface-2)",
                    color: mood === m ? "#fff" : "var(--mr-ink)",
                    borderColor: mood === m ? "var(--mr-plum)" : "var(--mr-line)",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Background</label>
            <div className="flex flex-wrap gap-2">
              {TILE_BGS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setTileBg(bg)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${tileBg === bg ? "ring-2 ring-offset-2" : ""}`}
                  style={{
                    background: tileBg === bg ? "var(--mr-plum)" : bg === "auto" ? "var(--mr-surface-2)" : bg,
                    color: tileBg === bg ? "#fff" : bg === "auto" ? "var(--mr-ink)" : bg === "#f7f6f8" ? "#070209" : "#fff",
                    borderColor: tileBg === bg ? "var(--mr-plum)" : "var(--mr-line)",
                  }}
                >
                  {bg === "auto" ? "Auto" : bg === "#070209" ? "Dark" : bg === "#f7f6f8" ? "Light" : bg === "#3b1f4a" ? "Plum" : "Gold"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="animated"
              checked={animated}
              onChange={(e) => setAnimated(e.target.checked)}
              className="rounded border-[var(--mr-line)]"
            />
            <label htmlFor="animated" className="text-sm cursor-pointer">Animated</label>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function HubDashboard() {
  const { me, refresh, signOut, loading } = useAuth();
  const { push } = useToast();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number | null>(null);
  const [statsDone, setStatsDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pending = 2;
    const tick = () => { if (!cancelled && --pending === 0) setStatsDone(true); };
    api.watchlist().then((r) => { if (!cancelled) setSavedCount(r.length); }).catch(() => {}).finally(tick);
    api.ratings().then((r) => { if (!cancelled) setRatingCount(r.length); }).catch(() => {}).finally(tick);
    return () => { cancelled = true; };
  }, []);

  const statValue = (n: number | null) =>
    n ?? (statsDone ? (
      <span style={{ color: "var(--mr-ink-soft)" }}>–</span>
    ) : (
      <span className="skeleton mx-auto block h-7 w-10 rounded" aria-hidden="true" />
    ));

  const handleAvatarSave = async (newSeed: string) => {
    await api.patchMe({ avatar_seed: newSeed });
    await refresh();
  };

  if (!me) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <AppBar title="Profile" showBack={false} brand />
      
      {/* Profile Header */}
      <div className="mr-card flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:gap-4 sm:text-left">
        <Avatar name={me.display_name} url={me.avatar_url} size={84} />
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-bold truncate">{me.display_name}</h1>
          <p className="text-sm truncate" style={{ color: "var(--mr-ink-soft)" }}>
            {me.email} · {me.email_verified ? "verified" : "unverified"}
          </p>
        </div>
        <Button variant="ghost" onClick={() => setAvatarPickerOpen(true)} className="w-full sm:w-auto">
          Change avatar
        </Button>
      </div>

      {/* Navigation Tabs */}
      <nav className="mt-6 mr-card p-2" aria-label="Profile sections">
        <div className="grid grid-cols-3 gap-2" role="tablist">
          <Link
            href="/profile/info"
            role="tab"
            className="mr-chip flex items-center justify-center px-2 py-3 text-[13px] sm:text-sm font-semibold text-center leading-tight"
          >
            <span>Profile</span>
          </Link>
          <Link
            href="/watchlist"
            role="tab"
            className="mr-chip flex items-center justify-center px-2 py-3 text-[13px] sm:text-sm font-semibold text-center leading-tight"
          >
            <span>Watchlist</span>
          </Link>
          <Link
            href="/profile/settings"
            role="tab"
            className="mr-chip flex items-center justify-center px-2 py-3 text-[13px] sm:text-sm font-semibold text-center leading-tight"
          >
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        <Link href="/watchlist" className="mr-card p-3 sm:p-4 text-center group">
          <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--mr-plum)" }}>{statValue(savedCount)}</p>
          <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Saved Titles</p>
        </Link>
        <Link href="/profile/ratings" className="mr-card p-3 sm:p-4 text-center group">
          <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--mr-gold)" }}>{statValue(ratingCount)}</p>
          <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Ratings Given</p>
        </Link>
        <Link href="/movie-night" className="mr-card p-3 sm:p-4 text-center group">
          <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--mr-ink)" }}>▶</p>
          <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Movie Nights</p>
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        <Button
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={async () => {
            await signOut();
            window.location.href = "/home";
          }}
        >
          Log out
        </Button>
      </div>

      <AvatarPickerDialog
        open={avatarPickerOpen}
        onClose={() => setAvatarPickerOpen(false)}
        currentSeed={me.avatar_seed}
        onSave={handleAvatarSave}
      />
    </div>
  );
}

function ProfileInner() {
  const { me, loading, refresh } = useAuth();
  const params = useSearchParams();
  const next = params.get("next") ?? "/home";
  if (loading) return <p role="status">Loading…</p>;
  return me ? <HubDashboard /> : <SignIn next={next} onDone={refresh} />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<p role="status">Loading…</p>}>
      <ProfileInner />
    </Suspense>
  );
}