"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Dialog } from "@/components/Dialog";
import { useToast } from "@/components/Toast";

export function AgeVerificationDialog({
  open,
  onClose,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}) {
  const { push } = useToast();
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.verifyAge(dob);
      push("Age verified. You can now turn off the adult-content filter.");
      onVerified();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.code === "underage") {
        setError("You must be at least 18 years old. The adult-content filter stays on.");
      } else {
        setError(err instanceof ApiError ? err.message : "Verification failed. Check the date and try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Verify your age">
      <p className="text-sm" style={{ color: "var(--mr-ink-soft)" }}>
        Turning off the adult-content filter requires confirming you are at least 18 years old.
        Enter your date of birth — it is checked once and <strong>never stored</strong>;
        only the verification outcome is kept on your account. See our{" "}
        <a href="/privacy" className="underline">Privacy Policy</a>.
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <Input
          label="Date of birth"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
          max={new Date().toISOString().slice(0, 10)}
          autoComplete="bday"
        />
        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={busy || !dob} className="flex-1">
            {busy ? "Verifying…" : "Verify age"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
