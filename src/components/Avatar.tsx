"use client";
import { useState } from "react";
import Image from "next/image";

export function Avatar({ name, url, size = 64 }: { name: string; url?: string | null; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  if (imgError || !url) {
    const initial = name.charAt(0).toUpperCase() || "M";
    return (
      <span
        role="img"
        aria-label={`Profile picture for ${name}`}
        className="inline-flex items-center justify-center rounded-full font-bold"
        style={{ width: size, height: size, background: "var(--mr-plum)", color: "#fff", fontSize: size / 2.5 }}
      >
        {initial}
      </span>
    );
  }

  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <Image
        src={url}
        alt={`Profile picture for ${name}`}
        width={size}
        height={size}
        className={`rounded-full ${imgLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
        style={{ width: size, height: size }}
        unoptimized
        onLoad={() => setImgLoading(false)}
        onError={() => setImgError(true)}
      />
      {imgLoading && (
        <span
          className="absolute inset-0 inline-flex items-center justify-center rounded-full font-bold"
          style={{ width: size, height: size, background: "var(--mr-plum)", color: "#fff", fontSize: size / 2.5 }}
          aria-hidden="true"
        >
          {name.charAt(0).toUpperCase() || "M"}
        </span>
      )}
    </span>
  );
}