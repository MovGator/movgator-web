"use client";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
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

type NativeDetector = { detect(v: HTMLVideoElement): Promise<{ rawValue: string }[]> };

export function QrScanner({ onDetected }: { onDetected: (target: { id: string; invite: string }) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  // Camera access is the requirement; decoding falls back to a bundled
  // JS decoder where the native BarcodeDetector API is missing (iOS Safari).
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      !!document.createElement("canvas").getContext("2d")
  );
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
      const nativeSupported = typeof window !== "undefined" && "BarcodeDetector" in window;
      let detectFrame: ((video: HTMLVideoElement) => Promise<string | null>) | null = null;
      if (nativeSupported) {
        try {
          const Detector = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => NativeDetector }).BarcodeDetector;
          const detector = new Detector({ formats: ["qr_code"] });
          detectFrame = async (video) => {
            const codes = await detector.detect(video);
            return codes?.[0]?.rawValue ?? null;
          };
        } catch {
          detectFrame = null;
        }
      }
      if (!detectFrame) {
        // Fallback decoder for browsers without BarcodeDetector (e.g. iOS
        // Safari): downscaled frames, checked a few times per second.
        if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          if (!cancelled) {
            setError("QR scanning isn't supported in this browser. Paste the invitation link instead.");
            setScanning(false);
          }
          return;
        }
        let lastCheck = 0;
        detectFrame = async (video) => {
          const now = Date.now();
          if (now - lastCheck < 400) return null;
          lastCheck = now;
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          if (!vw || !vh) return null;
          const scale = Math.min(1, 640 / Math.max(vw, vh));
          const w = Math.max(1, Math.round(vw * scale));
          const h = Math.max(1, Math.round(vh * scale));
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(video, 0, 0, w, h);
          try {
            const imageData = ctx.getImageData(0, 0, w, h);
            return jsQR(imageData.data, w, h)?.data ?? null;
          } catch {
            return null;
          }
        };
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
        const tick = async () => {
          if (cancelled) return;
          try {
            if (video.readyState >= 2 && detectFrame) {
              const raw = await detectFrame(video);
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
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function parseInviteLink(raw: string): { id: string; invite: string } | null {
  return extractNightTarget(raw);
}
