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
  t: Record<string, string>;
}

export function NewsletterForm({ variant = "card", showDescription = true, t }: NewsletterFormProps) {
  const tr = (key: string, vars?: Record<string, string>) => {
    let out = t[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, v);
    }
    return out;
  };
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
      push(tr("nl.success"));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : tr("nl.subscribeFailed");
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
          <span>{tr("footer.nlSuccess")}</span>
        </p>
      );
    }
    return (
      <form onSubmit={handleSubmit} className="nl-footer" aria-label={tr("nl.signupAria")}>
        <label htmlFor="nl-footer-email" className="sr-only">
          {tr("nl.email")}
        </label>
        <div className="nl-footer-row">
          <input
            id="nl-footer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tr("nl.placeholder")}
            required
            autoComplete="email"
            className="nl-footer-input"
          />
          <button type="submit" disabled={busy} aria-label={tr("nl.subscribe")} className="nl-footer-submit">
            <ArrowRight size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>
        {busy && (
          <p role="status" className="nl-footer-note">
            {tr("footer.nlSubscribing")}
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
          <span>{tr("footer.nlSuccess")}</span>
        </p>
        <p className="font-display nl-title">{tr("nl.success")}</p>
        <p className="nl-sub">{tr("footer.nlMicrocopy")}</p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-end" role="search" aria-label={tr("nl.signupAria")}>
        <div className="min-w-0 flex-1">
          <Input
            label={tr("nl.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tr("nl.placeholder")}
            required
            autoComplete="email"
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full shrink-0 sm:w-auto">
          {busy ? tr("nl.subscribing") : tr("nl.subscribe")}
        </Button>
      </form>
    );
  }

  return (
    <div className="nl-banner">
      {showDescription && (
        <>
          <p className="nl-eyebrow">{tr("nl.eyebrow")}</p>
          <h2 id="nl-title" className="font-display nl-title">{tr("nl.title")}</h2>
          <p className="nl-sub">{tr("nl.description")}</p>
        </>
      )}
      <form onSubmit={handleSubmit} className="nl-form" aria-label={tr("nl.signupAria")}>
        <label htmlFor="nl-email" className="sr-only">
          {tr("nl.email")}
        </label>
        <div className="nl-field">
          <EnvelopeSimple size={18} weight="regular" aria-hidden="true" />
          <input
            id="nl-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tr("nl.placeholder")}
            required
            autoComplete="email"
            className="nl-input"
          />
        </div>
        <button type="submit" disabled={busy} className="nl-submit">
          {busy ? tr("nl.subscribing") : tr("nl.subscribe")}
        </button>
      </form>
      {busy && (
        <p role="status" className="nl-note">
          {tr("nl.sending")}
        </p>
      )}
      {error && (
        <p role="alert" className="nl-error">
          {error}
        </p>
      )}
      <p className="nl-legal">
        {tr("nl.privacyPrefix")}<a href="/privacy">{tr("nl.privacyLink")}</a>.
      </p>
    </div>
  );
}