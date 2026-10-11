"use client";
import { Suspense } from "react";
import InvitationContent from "./InvitationContent";

export default function InvitationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p role="status" className="p-8 text-center">Loading invitation…</p>}>
      <InvitationContent params={params} />
    </Suspense>
  );
}