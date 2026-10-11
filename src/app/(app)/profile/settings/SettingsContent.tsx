"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Key, Shield, Eye, Palette, File, Info, Trash, User, Envelope, Bell, Globe, Gear, List } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { Dialog } from "@/components/Dialog";
import { AppBar } from "@/components/AppBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function SettingsContent() {
  const { me, refresh, signOut, loading } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/profile";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (me) setName(me.display_name);
  }, [me]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patchMe({ display_name: name });
      await refresh();
      push("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save settings.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.patchMe({ password: newPassword, current_password: password });
      push("Password changed.");
      setPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change password.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.deleteMe();
      await signOut();
      router.push("/");
    } catch {
      push("Couldn't delete account.");
      setSaving(false);
    }
  };

  if (loading) return <p role="status" className="p-8 text-center">Loading…</p>;
  if (!me) return <Link href={`/profile?next=/profile/settings`}><p className="p-8 text-center">Please sign in</p></Link>;

  return (
    <div className="mx-auto max-w-3xl">
      <AppBar title="Settings" backFallback="/profile" />
      
      {/* Account Info Section */}
      <section className="mt-6 mr-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-plum)", color: "#fff" }}>
            <User size={20} weight="regular" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-bold">Account Info</h2>
        </div>
        
        <form onSubmit={saveProfile} className="space-y-4">
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          <div className="flex items-center gap-3 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            <Envelope size={18} weight="regular" aria-hidden="true" />
            <span>{me.email}</span>
            {me.email_verified && (
              <span className="mr-chip px-2 py-0.5 text-xs" style={{ background: "var(--mr-gold)", color: "#24102e" }}>Verified</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            <Key size={18} weight="regular" aria-hidden="true" />
            <span>{me.auth_provider === "google" ? "Google OAuth" : "Email & Password"}</span>
          </div>
          <div className="pt-2 border-t">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving…" : "Save Display Name"}
            </Button>
          </div>
        </form>
      </section>

      {/* Security Section */}
      <section className="mt-6 mr-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-gold)", color: "#24102e" }}>
            <Shield size={20} weight="regular" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-bold">Security</h2>
        </div>

        <form onSubmit={changePassword} className="space-y-3">
          <h3 className="text-sm font-semibold">Change Password</h3>
          <Input label="Current Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
          <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>At least 8 characters with letters and numbers.</p>
          <div className="pt-2 border-t">
            <Button type="submit" disabled={saving} className="w-full" variant="ghost">
              {saving ? "Changing…" : "Update Password"}
            </Button>
          </div>
        </form>

        <div className="pt-2 border-t">
          <Button variant="ghost" onClick={async () => { await signOut(); router.push("/home"); }} className="w-full">
            Sign Out Everywhere
          </Button>
          <p className="text-xs text-center" style={{ color: "var(--mr-ink-soft)" }}>
            Signs you out on all devices. You'll need to sign in again.
          </p>
        </div>
      </section>

      {/* Content Filters Section */}
      <section className="mt-6 mr-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-ink)", color: "#fff" }}>
            <Eye size={20} weight="regular" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-bold">Content Filters</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Adult Content Filter</p>
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Hide mature-rated content from recommendations and search.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[var(--mr-line)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--mr-plum)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--mr-plum)]" />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Parental Controls</p>
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Require PIN for mature content access. <span className="text-orange-600">(Not yet implemented)</span></p>
            </div>
            <Button variant="ghost" disabled className="w-auto">Coming Soon</Button>
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
          Content filtering uses provider ratings (TMDB, MPAA, etc.). Accuracy depends on source data.
        </p>
      </section>

      {/* Theme / Skin Section */}
      <section className="mt-6 mr-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-plum)", color: "#fff" }}>
            <Palette size={20} weight="regular" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-bold">Theme / Skin</h2>
        </div>

        <div className="mt-3">
          <ThemeToggle />
        </div>
        <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
          Your preference is saved locally and applied automatically on each visit.
        </p>
      </section>

      {/* Privacy Policy & Data Section */}
      <section className="mt-6 mr-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-gold)", color: "#24102e" }}>
            <File size={20} weight="regular" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-bold">Privacy Policy & Data</h2>
        </div>

        <div className="space-y-3">
          <Link href="/profile/export" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <File size={20} weight="regular" aria-hidden="true" />
            <span>Export My Data</span>
          </Link>
          <Link href="/profile/consent" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <Globe size={20} weight="regular" aria-hidden="true" />
            <span>Tracking Consent</span>
          </Link>
          <Link href="/privacy" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <Shield size={20} weight="regular" aria-hidden="true" />
            <span>Privacy Policy</span>
          </Link>
        </div>

        <div className="pt-4 border-t">
          <Button variant="danger" onClick={() => setConfirmDelete(true)} className="w-full">
            Delete Account
          </Button>
          <p className="text-xs text-center mt-2" style={{ color: "var(--mr-ink-soft)" }}>
            Permanently removes your profile, watchlist, ratings and Movie Nights. This cannot be undone.
          </p>
        </div>

        <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your account?">
          <p className="text-sm">This permanently removes your profile, watchlist, ratings and Movie Nights. This can&rsquo;t be undone.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Keep my account</Button>
            <Button variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting…" : "Delete everything"}
            </Button>
          </div>
        </Dialog>
      </section>

      {/* Support & Info Section */}
      <section className="mt-6 mr-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-ink)", color: "#fff" }}>
            <Info size={20} weight="regular" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-bold">Support & Info</h2>
        </div>

        <div className="space-y-3">
          <Link href="/faq" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <Bell size={20} weight="regular" aria-hidden="true" />
            <span>Help Center</span>
          </Link>
          <Link href="/contact" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <Envelope size={20} weight="regular" aria-hidden="true" />
            <span>Contact Support</span>
          </Link>
          <Link href="/terms" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <File size={20} weight="regular" aria-hidden="true" />
            <span>Terms of Service</span>
          </Link>
          <Link href="/privacy" className="mr-chip flex items-center gap-3 px-3 py-2 text-left justify-start w-full">
            <Shield size={20} weight="regular" aria-hidden="true" />
            <span>Privacy Policy</span>
          </Link>
        </div>

        <div className="pt-4 border-t text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          <p>MovGator v1.0.0</p>
          <p>Build: 2026.10.11</p>
          <p className="mt-2">© 2026 MovGator. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
}