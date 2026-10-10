"use client";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"fade-in" | "hold" | "scale-out" | "done">("fade-in");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("hold");
      setTimeout(() => {
        setPhase("scale-out");
        setTimeout(() => {
          setPhase("done");
          onComplete();
        }, 500);
      }, 800);
    }, 500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "var(--mr-bg)" }}
      role="img"
      aria-label="MovGator loading"
    >
      <div
        className={`flex flex-col items-center justify-center gap-4 transition-all duration-500 ease-out ${
          phase === "fade-in" ? "opacity-0" : "opacity-100"
        } ${phase === "scale-out" ? "scale-150 opacity-0" : ""}`}
        style={{
          transform: phase === "scale-out" ? "scale(1.5)" : "scale(1)",
          transitionDuration: phase === "scale-out" ? "500ms" : "700ms",
        }}
      >
        {/* Logo icon */}
        <div
          className="relative"
          style={{
            width: 120,
            height: 120,
            filter: "drop-shadow(0 8px 24px rgb(0 0 0 / 0.2))",
          }}
        >
          <svg
            viewBox="0 0 2612 416"
            width="120"
            height="120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M423.956 163.925V74.3109C423.956 33.523 391.206 1.07129 350.716 1.07129H72.9418C31.8562 1.07129 0 32.9275 0 74.3109V158.566C24.7109 160.948 41.681 179.109 41.681 204.118C41.681 229.126 22.3291 247.883 0 250.264V338.092C0 381.857 34.5358 414.905 75.0259 414.905H350.121C391.802 414.905 423.956 382.155 423.956 340.176V257.707C399.84 254.73 382.572 235.974 382.572 210.965C382.572 184.766 400.436 166.307 423.956 163.925Z"
              fill="#3B1F4A"
            />
            <path
              d="M212.463 358.998C295.562 358.998 362.927 291.633 362.927 208.535C362.927 125.436 295.562 58.0713 212.463 58.0713C129.365 58.0713 62 125.436 62 208.535C62 291.633 129.365 358.998 212.463 358.998Z"
              fill="#F5A623"
            />
            <path
              d="M211.982 153.666C230.045 153.666 244.688 139.024 244.688 120.961C244.688 102.898 230.045 88.2556 211.982 88.2556C193.92 88.2556 179.277 102.898 179.277 120.961C179.277 139.024 193.92 153.666 211.982 153.666Z"
              fill="white"
            />
            <path
              d="M126.333 217.181C144.396 217.181 159.039 202.539 159.039 184.476C159.039 166.413 144.396 151.771 126.333 151.771C108.271 151.771 93.6279 166.413 93.6279 184.476C93.6279 202.539 108.271 217.181 126.333 217.181Z"
              fill="white"
            />
            <path
              d="M160.497 314.542C179.181 314.542 194.328 299.395 194.328 280.711C194.328 262.026 179.181 246.879 160.497 246.879C141.812 246.879 126.665 262.026 126.665 280.711C126.665 299.395 141.812 314.542 160.497 314.542Z"
              fill="white"
            />
            <path
              d="M268.28 314.542C286.964 314.542 302.111 299.395 302.111 280.711C302.111 262.026 286.964 246.879 268.28 246.879C249.595 246.879 234.448 262.026 234.448 280.711C234.448 299.395 249.595 314.542 268.28 314.542Z"
              fill="white"
            />
            <path
              d="M299.556 216.474C317.494 216.474 332.035 201.933 332.035 183.995C332.035 166.057 317.494 151.516 299.556 151.516C281.618 151.516 267.077 166.057 267.077 183.995C267.077 201.933 281.618 216.474 299.556 216.474Z"
              fill="white"
            />
            <path
              d="M196.585 184.957V235.481L244.221 209.208L199.472 184.957H196.585Z"
              fill="#3B1F4A"
            />
          </svg>
        </div>

        {/* App name */}
        <span
          className="font-display text-3xl font-extrabold"
          style={{ color: "var(--mr-ink)" }}
          aria-hidden="true"
        >
          MovGator
        </span>

        {/* Tagline */}
        <p
          className="text-sm"
          style={{ color: "var(--mr-ink-soft)" }}
          aria-hidden="true"
        >
          Find what to watch tonight
        </p>

        {/* Loading indicator */}
        {phase !== "done" && (
          <div className="mt-6 flex items-center justify-center gap-1.5" role="status" aria-label="Loading">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: "var(--mr-gold)",
                  animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}