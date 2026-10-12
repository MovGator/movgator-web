"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/use-locale";

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
  const { t } = useLocale();

  const handleRequest = async () => {
    setBusy(true);
    setError("");
    try {
      await api.verifyEmailRequest();
      push(t("verify.sent"));
      setStep("verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("verify.failed"));
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
      push(t("verify.done"));
      onVerified();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("verify.invalid"));
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title={t("verify.title")} maxWidth="max-w-md">
      {step === "request" && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {t("verify.desc")}
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>{t("verify.later")}</Button>
            <Button onClick={handleRequest} disabled={busy} className="flex-1">
              {busy ? t("verify.sending") : t("verify.send")}
            </Button>
          </div>
        </div>
      )}
      {step === "verify" && (
        <form onSubmit={handleVerify} className="space-y-3">
          <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {t("verify.codeLabel")}
          </p>
          <Input label={t("verify.code")} value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} pattern="[0-9]*" inputMode="numeric" required autoComplete="one-time-code" />
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => { setStep("request"); setError(""); }}>{t("verify.resend")}</Button>
            <Button type="submit" disabled={busy} className="flex-1">{busy ? t("verify.verifying") : t("verify.verify")}</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}