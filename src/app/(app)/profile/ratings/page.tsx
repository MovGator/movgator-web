"use client";
import { Suspense } from "react";
import RatingsContent from "./RatingsContent";

export default function RatingsPage() {
  return (
    <Suspense fallback={<p role="status">Loading…</p>}>
      <RatingsContent />
    </Suspense>
  );
}