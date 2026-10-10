import Image from "next/image";

export function Avatar({ name, url, size = 64 }: { name: string; url?: string | null; size?: number }) {
  if (url) {
    return <Image src={url} alt={`Profile picture for ${name}`} width={size} height={size} className="rounded-full" style={{ width: size, height: size }} />;
  }
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
