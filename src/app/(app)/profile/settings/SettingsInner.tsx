"use client";
import { Suspense } from "react";
import SettingsInner from "./SettingsInner";

export default function SettingsPage() {
  return (
    <Suspense fallback={<p role="status">Loading…</p>}>
      <SettingsInner />
    </Suspense>
  );
}