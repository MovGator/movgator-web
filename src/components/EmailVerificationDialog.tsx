"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { useToast } from "@/components/Toast";

interface EmailVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function EmailVerificationDialog({ open, onClose, onVerified }: EmailVerificationDialogProps) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  const handleRequest = async () => {
    setBusy(true);
    setError("");
    try {
      await api.verifyEmailRequest();
      push("Verification code sent to your email.");
      setStep("verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send code.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.verifyEmailConfirm(code);
      push("Email verified!");
      onVerified();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired code.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Verify your email" maxWidth="max-w-md">
      {step === "request" && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Some features require a verified email address. We&rsquo;ll send a 6-digit code to your email.
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Later</Button>
            <Button onClick={handleRequest} disabled={busy} className="flex-1">
              {busy ? "Sending…" : "Send code"}
            </Button>
          </div>
        </div>
      )}
      {step === "verify" && (
        <form onSubmit={handleVerify} className="space-y-3">
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Enter the 6-digit code sent to your email.
          </p>
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} pattern="[0-9]*" inputMode="numeric" required autoComplete="one-time-code" />
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => { setStep("request"); setError(""); }}>Resend code</Button>
            <Button type="submit" disabled={busy} className="flex-1">{busy ? "Verifying…" : "Verify"}</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}