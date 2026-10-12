"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { EnvelopeSimple, Check } from "@phosphor-icons/react";

interface NewsletterFormProps {
  variant?: "inline" | "card";
  showDescription?: boolean;
}

export function NewsletterForm({ variant = "card", showDescription = true }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { push } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.newsletterSubscribe(email, "website");
      setSubmitted(true);
      push("Thanks for subscribing! Check your email to confirm.");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't subscribe. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="mr-chip flex items-center gap-3 px-4 py-4 text-center" style={{ background: "var(--mr-surface-2)" }}>
        <Check size={24} weight="fill" style={{ color: "var(--mr-gold)" }} aria-hidden="true" />
        <span className="font-medium">You&rsquo;re subscribed! Check your inbox to confirm.</span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-end" role="search" aria-label="Newsletter signup">
        <div className="min-w-0 flex-1">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full shrink-0 sm:w-auto">
          {busy ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <div className="mr-card mx-auto w-full p-5 sm:p-6" style={{ maxWidth: 480 }}>
      {showDescription && (
        <div className="space-y-1">
          <p className="font-semibold text-lg">Get movie updates in your inbox</p>
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            New releases, hidden gems, and MovGator updates. No spam, unsubscribe anytime.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <span aria-hidden="true" className="flex h-[44px] w-6 shrink-0 items-center justify-center" style={{ color: "var(--mr-ink-soft)" }}>
            <EnvelopeSimple size={18} weight="regular" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
        </div>
        {busy && <p className="text-xs text-center" style={{ color: "var(--mr-ink-soft)" }}>Sending…</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Subscribing…" : "Subscribe"}
        </Button>
        <p className="text-xs text-center" style={{ color: "var(--mr-ink-soft)" }}>
          By subscribing you agree to our <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
}