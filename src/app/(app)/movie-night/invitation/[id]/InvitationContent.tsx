"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, EyeSlash, Shield, CheckCircle, XCircle, QrCode, Copy } from "@phosphor-icons/react";
import { api, ApiError, type NightInvitation } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { AppBar } from "@/components/AppBar";
import { Dialog } from "@/components/Dialog";
import { useToast } from "@/components/Toast";

function invitationHref(nightId: string, invite: string) {
  return `/movie-night/invitation/${nightId}?invite=${encodeURIComponent(invite)}`;
}

export default function InvitationContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { me, loading: authLoading } = useAuth();
  const { push } = useToast();
  const [nightId, setNightId] = useState("");
  const [invitation, setInvitation] = useState<NightInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [guestName, setGuestName] = useState("");

  const inviteToken = searchParams.get("invite") ?? "";

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setNightId(id);
      setLoading(true);
      setError(null);
      try {
        const detail = await api.nightInvitation(id, inviteToken);
        setInvitation(detail);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 410) setError("This invitation has expired.");
          else if (err.status === 403) setError("Invalid invitation link.");
          else if (err.status === 404) setError("Movie Night not found.");
          else setError(err.message);
        } else {
          setError("Failed to load invitation.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params, inviteToken]);

  const handleRespond = async (accept: boolean) => {
    if (!invitation) return;
    setResponding(true);
    try {
      const r = await api.nightRespond(invitation.night_id, inviteToken, accept, me ? undefined : guestName || undefined);
      if (accept) {
        if (r.guest_key) {
          const raw = r.guest_key.startsWith("guest:") ? r.guest_key.slice(6) : r.guest_key;
          try {
            sessionStorage.setItem(`mr-night-${invitation.night_id}`, JSON.stringify({ invite: inviteToken, guestKey: raw }));
          } catch {
            /* private mode */
          }
        }
        push("Invitation accepted!");
        router.push(`/movie-night/${invitation.night_id}?invite=${encodeURIComponent(inviteToken)}&joined=1`);
      } else {
        push("Invitation declined.");
        router.push("/movie-night");
      }
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Failed to respond to invitation.");
    } finally {
      setResponding(false);
    }
  };

  const copyInviteLink = async () => {
    if (!invitation || typeof window === "undefined") return;
    const url = `${window.location.origin}/movie-night/${invitation.night_id}?invite=${inviteToken}`;
    try {
      await navigator.clipboard.writeText(url);
      push("Invitation link copied!");
    } catch {
      push("Failed to copy link.");
    }
  };

  if (authLoading || loading) return <p role="status" className="p-8 text-center">Loading invitation…</p>;
  if (error || !invitation) {
    return (
      <div className="mx-auto max-w-md">
        <AppBar title="Invitation" showBack={false} brand />
        <div className="mt-6 mr-card p-8 text-center">
          <XCircle size={48} weight="fill" style={{ color: "var(--mr-gold)" }} aria-hidden="true" />
          <h1 className="font-display mt-4 text-xl font-bold">Invitation Issue</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {error || "This invitation link is invalid or has expired."}
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Link href="/movie-night" className="mr-btn-primary px-5 py-2.5">Browse Movie Nights</Link>
            <Link href={`/profile?next=${encodeURIComponent(invitationHref(nightId || "", inviteToken))}`} className="mr-chip px-4 py-2 text-sm font-semibold">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  const sched = invitation.scheduled_at ? new Date(invitation.scheduled_at) : null;
  const isExpired = !!invitation.invite_expires_at && new Date(invitation.invite_expires_at) < new Date();
  const isMember = invitation.is_member;
  const signInNext = `/movie-night/invitation/${invitation.night_id}?invite=${encodeURIComponent(inviteToken)}`;

  return (
    <div className="mx-auto max-w-2xl">
      <AppBar title="Invitation" showBack={false} brand />

      <div className="mt-6 mr-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">{invitation.night_name}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
              Code: {invitation.night_code} · Hosted by {invitation.host_name}
            </p>
          </div>
          <span className="mr-chip px-3 py-1 text-sm font-semibold shrink-0 capitalize">{invitation.night_status}</span>
        </div>

        {isExpired && (
          <div className="mt-4 p-3 rounded-lg flex items-center gap-2 bg-yellow-50 border border-yellow-200" role="alert">
            <Shield size={18} weight="fill" aria-hidden="true" />
            <span className="text-sm">This invitation has expired.</span>
          </div>
        )}
        {isMember && !isExpired && (
          <div className="mt-4 p-3 rounded-lg flex items-center gap-2 bg-green-50 border border-green-200" role="status">
            <CheckCircle size={18} weight="fill" aria-hidden="true" />
            <span className="text-sm">You&rsquo;ve already accepted this invitation.</span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {sched && (
            <div className="flex items-center gap-3 p-4 mr-card">
              <span className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-plum)", color: "#fff" }}>
                <Calendar size={20} weight="regular" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Scheduled for</p>
                <p className="font-medium">{sched.toLocaleString()}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-4 mr-card">
            <span className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-gold)", color: "#24102e" }}>
              <Users size={20} weight="regular" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Members</p>
              <p className="font-medium">{invitation.members_count} member{invitation.members_count === 1 ? "" : "s"}</p>
            </div>
          </div>
          {invitation.blind_voting && (
            <div className="flex items-center gap-3 p-4 mr-card">
              <span className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-ink)", color: "#fff" }}>
                <EyeSlash size={20} weight="regular" aria-hidden="true" />
              </span>
              <p className="font-medium">Blind voting — counts hidden until decided</p>
            </div>
          )}
        </div>

        {!me && !isExpired && !isMember && (
          <div className="mt-6 mr-card p-4">
            <p className="text-sm font-semibold">New here? Create an account or sign in — we&rsquo;ll bring you back to this invitation.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/profile?next=${encodeURIComponent(signInNext)}`} className="mr-btn-primary px-5 py-2.5">Sign in / Create account</Link>
            </div>
          </div>
        )}

        {!me && !isExpired && !isMember && (
          <div className="mt-4">
            <Input label="Display name for guests (optional)" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. Ama" maxLength={80} />
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {!isMember && !isExpired && (
            <>
              <Button variant="gold" onClick={() => handleRespond(true)} disabled={responding} className="flex-1">
                {responding ? "Accepting…" : me ? "Accept Invitation" : "Join as guest"}
              </Button>
              <Button variant="danger" onClick={() => handleRespond(false)} disabled={responding} className="flex-1">
                Decline
              </Button>
            </>
          )}
          {isMember && (
            <Link href={`/movie-night/${invitation.night_id}?invite=${encodeURIComponent(inviteToken)}&joined=1`} className="mr-btn-gold px-5 py-2.5 text-center flex-1">
              Open Movie Night
            </Link>
          )}
        </div>

        <div className="mt-6 pt-6 border-t space-y-4">
          <h2 className="font-display text-lg font-bold">Share this Invitation</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 mr-card p-3 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/movie-night/${invitation.night_id}?invite=${inviteToken}` : ""}
                className="flex-1 bg-transparent text-sm truncate"
                aria-label="Invitation link"
              />
              <Button variant="ghost" onClick={copyInviteLink} aria-label="Copy invitation link">
                <Copy size={18} weight="regular" aria-hidden="true" />
              </Button>
            </div>
            <Button variant="ghost" onClick={() => setShowQR(true)} className="shrink-0">
              <QrCode size={20} weight="regular" aria-hidden="true" />
              <span className="hidden sm:inline ml-1">QR Code</span>
            </Button>
          </div>
          {invitation.invite_expires_at && (
            <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
              Expires {new Date(invitation.invite_expires_at).toLocaleString()}.
            </p>
          )}
        </div>

        <Dialog open={showQR} onClose={() => setShowQR(false)} title="Invitation QR code">
          <div className="text-center">
            <div className="inline-block bg-white p-3 rounded">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/movie-night/${invitation.night_id}?invite=${inviteToken}` : "")}`}
                alt="Movie Night invitation QR code"
                width={220}
                height={220}
              />
            </div>
            <p className="mt-3 text-xs" style={{ color: "var(--mr-ink-soft)" }}>Scan to open this invitation.</p>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
