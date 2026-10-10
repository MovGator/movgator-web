"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function AuthPrompt({ action, returnTo }: { action: string; returnTo: string }) {
  const { loading } = useAuth();
  if (loading) return null;
  const href = `/profile?next=${encodeURIComponent(returnTo)}`;
  return (
    <div className="mr-card p-4 text-sm" role="note" aria-label={`Sign in to ${action}`}>
      <p>
        <strong>Sign in to {action}.</strong> Browsing stays free — an account keeps
        your list, ratings and nights in sync.
      </p>
      <p className="mt-2">
        <Link href={href} className="font-semibold underline">
          Sign in or create an account
        </Link>
      </p>
    </div>
  );
}
