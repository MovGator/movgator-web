"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Calendar, Users, EyeSlash, Shield, CheckCircle, XCircle, QrCode, Share, Copy } from "@phosphor-icons/react";
import { api, ApiError, req } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/Button";
import { AppBar } from "@/components/AppBar";
import { useToast } from "@/components/Toast";
import { EmptyState } from "@/components/Movie";
import Link from "next/link";

export default function InvitationContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { me, refresh, loading: authLoading } = useAuth();
  const { push } = useToast();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const inviteToken = searchParams.get("invite") ?? "";

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setLoading(true);
      setError(null);
      try {
        const detail = await req(`/api/v1/movie-nights/${id}/invitation?invite=${encodeURIComponent(inviteToken)}`);
        setInvitation(detail);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 410) {
            setError("This invitation has expired.");
          } else if (err.status === 403) {
            setError("Invalid invitation link.");
          } else if (err.status === 404) {
            setError("Movie Night not found.");
          } else {
            setError(err.message);
          }
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
      await req(`/api/v1/movie-nights/${invitation.night_id}/invitation/respond?invite=${encodeURIComponent(inviteToken)}`, {
        method: "POST",
        body: JSON.stringify({ accept }),
      });
      push(accept ? "Invitation accepted!" : "Invitation declined.");
      if (accept) {
        // Redirect to the movie night page
        router.push(`/movie-night/${invitation.night_id}${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ""}`);
      } else {
        router.push("/movie-night");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        push(err.message);
      } else {
        push("Failed to respond to invitation.");
      }
    } finally {
      setResponding(false);
    }
  };

  const copyInviteLink = async () => {
    if (!invitation) return;
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${base}/movie-night/${invitation.night_id}?invite=${inviteToken}`;
    try {
      await navigator.clipboard.writeText(url);
      push("Invitation link copied!");
    } catch {
      push("Failed to copy link.");
    }
  };

  if (authLoading) return <p role="status" className="p-8 text-center">Loading…</p>;
  if (!me && loading) return <p role="status" className="p-8 text-center">Loading…</p>;
  if (loading) return <p role="status" className="p-8 text-center">Loading invitation…</p>;
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
            <Link href="/movie-night">
              <Button variant="primary">Browse Movie Nights</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sched = invitation.scheduled_at ? new Date(invitation.scheduled_at) : null;
  const isExpired = invitation.invite_expires_at && new Date(invitation.invite_expires_at) < new Date();
  const isMember = invitation.is_member;

  return (
    <div className="mx-auto max-w-2xl">
      <AppBar title="Invitation" showBack={false} brand />
      
      <div className="mt-6 mr-card p-6">
        {/* Header with movie night name and status */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">{invitation.night_name}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
              Code: {invitation.night_code} · Hosted by {invitation.host_name}
            </p>
          </div>
          <span className={`mr-chip px-3 py-1 text-sm font-semibold shrink-0 ${
            invitation.night_status === "closed" ? "bg-red-100 text-red-700" :
            invitation.night_status === "decided" ? "bg-green-100 text-green-700" :
            invitation.night_status === "voting" ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-700"
          }`}>
            {invitation.night_status.charAt(0).toUpperCase() + invitation.night_status.slice(1)}
          </span>
        </div>

        {/* Warning banners */}
        {isExpired && (
          <div className="mt-4 p-3 mr-chip bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2" role="alert">
            <Shield size={18} weight="fill" style={{ color: "var(--mr-gold)" }} aria-hidden="true" />
            <span className="text-sm">This invitation has expired.</span>
          </div>
        )}
        {isMember && !isExpired && (
          <div className="mt-4 p-3 mr-chip bg-green-50 border border-green-200 rounded-lg flex items-center gap-2" role="status">
            <CheckCircle size={18} weight="fill" style={{ color: "green" }} aria-hidden="true" />
            <span className="text-sm">You&rsquo;ve already accepted this invitation.</span>
          </div>
        )}
        {isExpired && !isMember && (
          <div className="mt-4 p-3 mr-chip bg-red-50 border border-red-200 rounded-lg flex items-center gap-2" role="alert">
            <XCircle size={18} weight="fill" style={{ color: "red" }} aria-hidden="true" />
            <span className="text-sm">This invitation has expired and can no longer be accepted.</span>
          </div>
        )}

        {/* Movie Night Details */}
        <div className="mt-6 space-y-4">
          {invitation.scheduled_at && sched && (
            <div className="flex items-center gap-3 p-4 mr-card">
              <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-plum)", color: "#fff" }}>
                <Calendar size={20} weight="regular" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Scheduled for</p>
                <p className="font-medium">{sched.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 mr-card">
            <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-gold)", color: "#24102e" }}>
              <Users size={20} weight="regular" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Members</p>
              <p className="font-medium">{invitation.members_count} member{invitation.members_count === 1 ? "" : "s"}</p>
            </div>
          </div>

          {invitation.blind_voting && (
            <div className="flex items-center gap-3 p-4 mr-card">
              <div className="mr-chip inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--mr-ink)", color: "#fff" }}>
                <EyeSlash size={20} weight="regular" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Voting Mode</p>
                <p className="font-medium">Blind voting — counts hidden until decided</p>
              </div>
            </div>
          )}

          {(invitation.prefs?.genres || invitation.prefs?.mood || invitation.prefs?.max_runtime) && (
            <div className="p-4 mr-card">
              <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>Group Preferences</p>
              <p className="mt-1 text-sm">
                {[
                  Array.isArray(invitation.prefs.genres) ? invitation.prefs.genres.join(", ") : invitation.prefs.genres,
                  invitation.prefs.mood ? `${invitation.prefs.mood} mood` : null,
                  invitation.prefs.max_runtime ? `under ${invitation.prefs.max_runtime} min` : null,
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {(!isMember && !isExpired) && (
            <>
              <Button variant="gold" onClick={() => handleRespond(true)} disabled={responding} className="flex-1">
                {responding ? "Accepting…" : "Accept Invitation"}
              </Button>
              <Button variant="danger" onClick={() => handleRespond(false)} disabled={responding} className="flex-1">
                Decline
              </Button>
            </>
          )}
          {isMember && (
            <Link href={`/movie-night/${invitation.night_id}${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ""}`}>
              <Button variant="gold" className="flex-1">
                Open Movie Night
              </Button>
            </Link>
          )}
        </div>

        {/* Invitation Link & QR Code */}
        <div className="mt-6 pt-6 border-t space-y-4">
          <h3 className="font-display text-lg font-bold">Share this Invitation</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 mr-card p-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/movie-night/${invitation.night_id}?invite=${inviteToken}`}
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
              This invitation expires on {new Date(invitation.invite_expires_at).toLocaleString()}.
            </p>
          )}
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowQR(false)} role="dialog" aria-modal="true" aria-labelledby="qr-title">
            <div className="mr-card p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
              <h3 id="qr-title" className="font-display text-lg font-bold mb-4">Invitation QR Code</h3>
              <div className="mr-card p-4 inline-block" style={{ background: "white" }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/movie-night/${invitation.night_id}?invite=${inviteToken}`)}`}
                  alt="Invitation QR Code"
                  width={256}
                  height={256}
                />
              </div>
              <p className="mt-4 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
                Scan with your camera to open the invitation
              </p>
              <Button variant="ghost" onClick={() => setShowQR(false)} className="mt-4 w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}