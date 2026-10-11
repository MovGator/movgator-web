"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User, Envelope, Key, Calendar, ArrowLeft, List, Gear } from "@phosphor-icons/react";
import { api } from "@/lib/api";
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

export default function ProfileInfoPage() {
  const { me, refresh, signOut, loading } = useAuth();
  const { push } = useToast();
  const [name, setName] = useState("");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  useEffect(() => {
    if (me) setName(me.display_name);
  }, [me]);

  const handleAvatarSave = async (newSeed: string) => {
    await api.patchMe({ avatar_seed: newSeed });
    await refresh();
  };

  if (loading) return <p role="status" className="p-8 text-center">Loading…</p>;
  if (!me) return <Link href="/profile?next=/profile/info"><p className="p-8 text-center">Please sign in</p></Link>;

  return (
    <div className="mx-auto max-w-3xl">
      <AppBar title="Profile Information" backFallback="/profile" />
      <div className="mr-card flex items-center gap-4 p-5">
        <Avatar name={me.display_name} url={me.avatar_url} size={72} />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{me.display_name}</h1>
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {me.email} · {me.email_verified ? "verified" : "unverified"}
          </p>
        </div>
        <Button variant="ghost" onClick={() => setAvatarPickerOpen(true)}>
          Change avatar
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Account Details</h2>
        <div className="mt-3 mr-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-plum)", color: "#fff" }}>
              <User size={20} weight="regular" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Display Name</p>
              <p className="font-medium">{me.display_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-gold)", color: "#24102e" }}>
              <Envelope size={20} weight="regular" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Email Address</p>
              <p className="font-medium">{me.email}</p>
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
                {me.email_verified ? "Verified" : "Not verified"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-plum)", color: "#fff" }}>
              <Key size={20} weight="regular" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Sign-in Method</p>
              <p className="font-medium capitalize">{me.auth_provider === "google" ? "Google OAuth" : "Email & Password"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-ink)", color: "#fff" }}>
              <Calendar size={20} weight="regular" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Member Since</p>
              <p className="font-medium">Account created</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Quick Actions</h2>
        <div className="mt-3 mr-card p-5 space-y-3">
          <Link href="/watchlist" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <User size={20} weight="regular" aria-hidden="true" />
            <span>My Watchlist</span>
          </Link>
          <Link href="/profile/ratings" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <List size={20} weight="regular" aria-hidden="true" />
            <span>My Ratings</span>
          </Link>
          <Link href="/profile/settings" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <Gear size={20} weight="regular" aria-hidden="true" />
            <span>Settings</span>
          </Link>
        </div>
      </section>

      <div className="mt-6 flex gap-2">
        <Button
          variant="ghost"
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