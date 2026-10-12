"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { EmailVerificationDialog } from "./EmailVerificationDialog";

export function EmailVerificationGuard({ children }: { children: React.ReactNode }) {
  const { me } = useAuth();
  const [verifyOpen, setVerifyOpen] = useState(false);

  // Listen for email verification required events
  useEffect(() => {
    const handleEvent = (e: CustomEvent) => {
      if (e.detail?.code === "email_not_verified") {
        setVerifyOpen(true);
      }
    };
    window.addEventListener("mr-email-verification-required", handleEvent as EventListener);
    return () => window.removeEventListener("mr-email-verification-required", handleEvent as EventListener);
  }, []);

  return (
    <>
      {children}
      <EmailVerificationDialog
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onVerified={() => setVerifyOpen(false)}
      />
    </>
  );
}