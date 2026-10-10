"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

export function BackButton({ fallback = "/home" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        // Preserves the previous screen (scroll + filters) when there is
        // history; otherwise falls back to a sensible destination.
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="mr-chip inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold"
    >
      <ArrowLeft size={16} weight="regular" aria-hidden="true" />
      Back
    </button>
  );
}
