"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { LogoIcon } from "./Logo";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** App-only install affordance. Renders nothing on marketing pages,
 *  when already installed, or when the platform offers no prompt. */
export function InstallCard({ compact }: { compact?: boolean }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(true); // assume installed until proven otherwise
  const [done, setDone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (!standalone) setInstalled(false);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || done) return null;

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setDone(true);
      setDeferred(null);
    }
  };

  // Settings-row variant: a single action button, only when installable.
  if (compact) {
    if (!deferred) return null;
    return (
      <Button variant="ghost" onClick={install}>
        Install MovGator on this device
      </Button>
    );
  }
  return (
    <div className="mr-card flex items-center gap-3 p-4" role="region" aria-label="Install MovGator">
      <LogoIcon size={44} />
      <div className="flex-1">
        <p className="font-display font-bold">Install MovGator</p>
        <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>
          {deferred
            ? "Add it to your home screen for the full app experience."
            : "On iPhone: Share → Add to Home Screen. On Android: menu → Install app."}
        </p>
        <p id="install-manual" className="sr-only">
          To install manually, use your browser's Add to Home Screen or Install app option.
        </p>
      </div>
      {deferred ? (
        <Button variant="gold" onClick={install}>
          Install
        </Button>
      ) : (
        <Link href="/get-started" className="mr-chip px-4 py-2 text-sm font-semibold">
          Install guide
        </Link>
      )}
    </div>
  );
}
