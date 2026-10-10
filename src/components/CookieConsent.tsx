"use client";
import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/Button";

const CONSENT_KEY = "movgator-cookie-consent";
const CONSENT_VERSION = 1;

interface ConsentData {
  version: number;
  necessary: boolean;
  analytics: boolean;
  timestamp: number;
}

export function CookieConsentBanner() {
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState<ConsentData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentData;
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }
    setShow(true);
  }, []);

  const acceptAll = () => {
    const data: ConsentData = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    setConsent(data);
    setShow(false);
    // Load analytics after consent
    if (typeof window !== "undefined" && (window as any).loadAnalytics) {
      (window as any).loadAnalytics();
    }
  };

  const acceptNecessary = () => {
    const data: ConsentData = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: false,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    setConsent(data);
    setShow(false);
  };

  if (!show || consent) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto md:bottom-6 md:left-auto md:right-6 md:max-w-md animate-slide-up"
    >
      <div className="mr-card p-4 md:p-6 border border-[var(--mr-line)] shadow-xl">
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm md:text-base">
              We value your privacy
            </h3>
            <p
              id="cookie-consent-description"
              className="mt-1 text-xs md:text-sm leading-relaxed"
              style={{ color: "var(--mr-ink-soft)" }}
            >
              MovGator uses essential cookies for authentication and security. With your
              consent, we may also use privacy-friendly analytics to improve the experience.
              No advertising cookies. Read our{" "}
              <a href="/privacy" className="underline font-medium">
                Privacy Policy
              </a>
              .
            </p>
          </div>
          <button
            type="button"
            className="mr-chip inline-flex items-center justify-center p-1.5 shrink-0"
            style={{ color: "var(--mr-ink-soft)" }}
            onClick={() => setShow(false)}
            aria-label="Dismiss cookie notice"
          >
            <X size={18} weight="regular" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="primary" onClick={acceptAll} className="min-w-[140px]">
            Accept all
          </Button>
          <Button variant="ghost" onClick={acceptNecessary} className="min-w-[140px]">
            Essential only
          </Button>
        </div>
        <p className="mt-3 text-[11px] text-center" style={{ color: "var(--mr-ink-soft)" }}>
          You can change your preferences anytime from the{" "}
          <a href="/privacy" className="underline">Privacy page</a>
          .
        </p>
      </div>
    </div>
  );
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentData;
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const updateConsent = (analytics: boolean) => {
    const data: ConsentData = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    setConsent(data);
    if (analytics && typeof window !== "undefined" && (window as any).loadAnalytics) {
      (window as any).loadAnalytics();
    }
  };

  return { consent, updateConsent };
}