"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { EnvelopeSimple, Check, ArrowRight } from "@phosphor-icons/react";

interface NewsletterFormProps {
  variant?: "inline" | "card" | "footer";
  showDescription?: boolean;
}

export function NewsletterForm({ variant = "card", showDescription = true }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { push } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.newsletterSubscribe(email, "website");
      setSubmitted(true);
      push("Thanks for subscribing! Check your email to confirm.");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't subscribe. Try again.";
      setError(message);
      push(message);
    } finally {
      setBusy(false);
    }
  };

  if (variant === "footer") {
    if (submitted) {
      return (
        <p role="status" className="nl-footer-success">
          <Check size={18} weight="bold" aria-hidden="true" />
          <span>You&rsquo;re on the list — check your inbox to confirm.</span>
        </p>
      );
    }
    return (
      <form onSubmit={handleSubmit} className="nl-footer" aria-label="Newsletter signup">
        <label htmlFor="nl-footer-email" className="sr-only">
          Email address
        </label>
        <div className="nl-footer-row">
          <input
            id="nl-footer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            autoComplete="email"
            className="nl-footer-input"
          />
          <button type="submit" disabled={busy} aria-label="Subscribe" className="nl-footer-submit">
            <ArrowRight size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>
        {busy && (
          <p role="status" className="nl-footer-note">
            Subscribing…
          </p>
        )}
        {error && (
          <p role="alert" className="nl-footer-error">
            {error}
          </p>
        )}
      </form>
    );
  }

  if (submitted) {
    return (
      <div className="nl-banner" role="status">
        <p className="nl-eyebrow">
          <Check size={16} weight="bold" aria-hidden="true" />
          <span>You&rsquo;re on the list</span>
        </p>
        <p className="font-display nl-title">Check your inbox to confirm</p>
        <p className="nl-sub">Tap the confirmation link we just emailed you — then the picks start landing.</p>
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
    <div className="nl-banner">
      {showDescription && (
        <>
          <p className="nl-eyebrow">The MovGator newsletter</p>
          <h2 id="nl-title" className="font-display nl-title">Get movie updates in your inbox</h2>
          <p className="nl-sub">New releases, hidden gems, and MovGator updates. No spam, unsubscribe anytime.</p>
        </>
      )}
      <form onSubmit={handleSubmit} className="nl-form" aria-label="Newsletter signup">
        <label htmlFor="nl-email" className="sr-only">
          Email address
        </label>
        <div className="nl-field">
          <EnvelopeSimple size={18} weight="regular" aria-hidden="true" />
          <input
            id="nl-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="nl-input"
          />
        </div>
        <button type="submit" disabled={busy} className="nl-submit">
          {busy ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {busy && (
        <p role="status" className="nl-note">
          Sending your confirmation…
        </p>
      )}
      {error && (
        <p role="alert" className="nl-error">
          {error}
        </p>
      )}
      <p className="nl-legal">
        By subscribing you agree to our <a href="/privacy">Privacy Policy</a>.
      </p>
    </div>
  );
}