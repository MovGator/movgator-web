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

type Detector = { detect(v: HTMLVideoElement): Promise<{ rawValue: string }[]> };

export function QrScanner({ onDetected }: { onDetected: (target: { id: string; invite: string }) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  const [supported] = useState(() => typeof window !== "undefined" && "BarcodeDetector" in window);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Attach the camera stream only after the <video> element has mounted.
  // (Starting the stream first leaves videoRef.current null, so the feed
  // would never attach and detection could never begin.)
  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    let raf = 0;

    const stopTracks = () => {
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
    };

    (async () => {
      if (typeof window !== "undefined" && window.isSecureContext === false) {
        if (!cancelled) {
          setError("Camera access needs a secure (HTTPS) connection. Open this page over HTTPS, or paste the invitation link instead.");
          setScanning(false);
        }
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stopTracks();
          return;
        }
        const video = videoRef.current;
        if (!video) {
          setError("Camera preview failed to start. Paste the invitation link instead.");
          setScanning(false);
          stopTracks();
          return;
        }
        video.srcObject = stream;
        await video.play();
        const Detector = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => Detector }).BarcodeDetector;
        const detector = new Detector({ formats: ["qr_code"] });
        const tick = async () => {
          if (cancelled) return;
          try {
            if (video.readyState >= 2) {
              const codes = await detector.detect(video);
              const raw = codes?.[0]?.rawValue;
              if (raw) {
                const target = extractNightTarget(raw);
                if (target) {
                  onDetectedRef.current(target);
                  setScanning(false);
                  return;
                }
                setError("That QR code isn't a Movie Night invitation. Try another code or paste the link.");
                setScanning(false);
                return;
              }
            }
          } catch {
            /* transient frame errors: keep scanning */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) {
        if (cancelled) return;
        const name = e instanceof DOMException ? e.name : "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          setError("Camera permission was denied. Allow camera access in your browser settings, or paste the invitation link instead.");
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          setError("No camera was found on this device. Paste the invitation link instead.");
        } else if (name === "NotReadableError") {
          setError("The camera is busy in another app. Close it and try again, or paste the invitation link.");
        } else {
          setError("Couldn't start the camera. Paste the invitation link instead.");
        }
        setScanning(false);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stopTracks();
    };
  }, [scanning]);

  const start = () => {
    setError(null);
    if (!supported) {
      setError("QR scanning isn't supported in this browser. Paste the invitation link instead.");
      return;
    }
    // Mount the <video> element first; the effect above attaches the stream.
    setScanning(true);
  };

  return (
    <div className="space-y-3">
      {!scanning ? (
        <Button variant="ghost" onClick={start} className="w-full sm:w-auto">Scan QR code</Button>
      ) : (
        <Button variant="ghost" onClick={() => setScanning(false)} className="w-full sm:w-auto">Stop scanning</Button>
      )}
      {scanning && (
        <video
          ref={videoRef}
          className="w-full rounded-lg bg-black"
          muted
          autoPlay
          playsInline
          aria-label="QR code camera preview"
        />
      )}
      {!supported && <p className="text-xs" style={{ color: "var(--mr-ink-soft)" }}>This browser can’t scan QR codes. Paste the invitation link below.</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function parseInviteLink(raw: string): { id: string; invite: string } | null {
  return extractNightTarget(raw);
}
