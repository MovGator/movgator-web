"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Lock } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AgeVerificationDialog } from "@/components/AgeVerificationDialog";
import { useToast } from "@/components/Toast";

interface CoverTitle {
  title: string;
  is_adult?: boolean;
  certification?: string | null;
}

/** Blurred-cover gate for mature titles while the viewer's filter is on.
 *
 * Renders children untouched when unrestricted; otherwise obscures the
 * artwork and shows the warning + disable CTA. The CTA lives OUTSIDE any
 * wrapping link (MatureCover wraps the poster link, never the reverse) so
 * cover art stays navigable and markup stays valid.
 */
export function MatureCover({
  title,
  children,
  roundedClassName = "rounded-lg",
}: {
  title: CoverTitle;
  children: React.ReactNode;
  roundedClassName?: string;
}) {
  const { me, filterOn, setFilterOn, refresh } = useAuth();
  const { push } = useToast();
  const path = usePathname();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!filterOn || !title.is_adult) return <>{children}</>;

  const disable = async () => {
    if (!me) return;
    if (!me.age_verified) {
      setVerifyOpen(true);
      return;
    }
    setBusy(true);
    try {
      await api.prefsPatch({ adult_filter_enabled: false });
      setFilterOn(false);
      await refresh();
      push("Adult-content filter is off.");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't change filter setting.");
    } finally {
      setBusy(false);
    }
  };

  const onVerified = async () => {
    setBusy(true);
    try {
      await api.prefsPatch({ adult_filter_enabled: false });
      setFilterOn(false);
      await refresh();
      push("Adult-content filter is off.");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't change filter setting.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`mature-cover ${roundedClassName}`}>
      <div className="mature-cover-art" aria-hidden="true">
        {children}
      </div>
      <div className="mature-cover-overlay">
        <span className="mature-cover-icon" aria-hidden="true">
          <Lock size={20} weight="bold" />
        </span>
        {title.certification && (
          <span className="mature-cert">{title.certification}</span>
        )}
        <p className="mature-msg">
          This movie is hidden because it contains adult-rated content.
        </p>
        {me ? (
          <button
            type="button"
            className="mature-cta"
            onClick={disable}
            disabled={busy}
          >
            {busy ? "Turning off…" : "Turn Off Adult Content Filter"}
          </button>
        ) : (
          <Link
            href={`/profile?next=${encodeURIComponent(path)}`}
            className="mature-cta"
          >
            Sign in to manage filtering
          </Link>
        )}
      </div>
      <AgeVerificationDialog
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onVerified={onVerified}
      />
    </div>
  );
}
