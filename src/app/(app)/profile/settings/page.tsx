"use client";
import { Suspense } from "react";
import SettingsContent from "./SettingsContent";

export default function SettingsPage() {
  return (
    <Suspense fallback={<p role="status">Loading…</p>}>
      <SettingsContent />
    </Suspense>
  );
}