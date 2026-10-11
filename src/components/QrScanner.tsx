"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";

function extractNightTarget(raw: string): { id: string; invite: string } | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const url = new URL(text, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const match = url.pathname.match(/\/movie-night\/(?:invitation\/)?([A-Za-z0-9_-]+)/);
    if (!match) return null;
    return { id: match[1], invite: url.searchParams.get("invite") ?? "" };
  } catch {
    return null;
  }
}

export function QrScanner({ onDetected }: { onDetected: (target: { id: string; invite: string }) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const [supported] = useState(() => typeof window !== "undefined" && "BarcodeDetector" in window);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const start = async () => {
    setError(null);
    if (!supported) {
      setError("QR scanning isn't supported in this browser. Paste the invitation link instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      const Detector = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect(v: HTMLVideoElement): Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      const detector = new Detector({ formats: ["qr_code"] });
      const tick = async () => {
        try {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            const codes = await detector.detect(videoRef.current);
            const raw = codes?.[0]?.rawValue;
            if (raw) {
              const target = extractNightTarget(raw);
              if (target) {
                onDetected(target);
                stop();
                return;
              }
              setError("That QR code isn't a Movie Night invitation.");
              stop();
              return;
            }
          }
        } catch {
          /* keep scanning */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Camera permission was denied. Allow camera access or paste the invitation link instead.");
      stop();
    }
  };

  return (
    <div className="space-y-3">
      {!scanning ? (
        <Button variant="ghost" onClick={start} className="w-full sm:w-auto">Scan QR code</Button>
      ) : (
        <Button variant="ghost" onClick={stop} className="w-full sm:w-auto">Stop scanning</Button>
      )}
      {scanning && <video ref={videoRef} className="w-full rounded-lg" muted playsInline aria-label="QR code camera preview" />}
      {!supported && <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>This browser can’t scan QR codes. Paste the invitation link below.</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function parseInviteLink(raw: string): { id: string; invite: string } | null {
  return extractNightTarget(raw);
}
