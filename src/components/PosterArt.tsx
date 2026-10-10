import Image from "next/image";
import type { Title } from "@/lib/types";

/** Branded placeholder when a title has no artwork (seed/demo catalogue). */
export function PosterArt({ title, large }: { title: Title; large?: boolean }) {
  if (title.poster_url) {
    return (
      <span className="block overflow-hidden rounded-lg">
        <Image
          src={title.poster_url}
          alt={`Poster for ${title.title}`}
          width={large ? 500 : 300}
          height={large ? 750 : 450}
          className="aspect-[2/3] w-full object-cover"
          loading="lazy"
        />
      </span>
    );
  }
  const initial = title.title.charAt(0).toUpperCase();
  return (
    <span
      role="img"
      aria-label={`No poster available for ${title.title}`}
      className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-2 rounded-lg"
      style={{ background: "linear-gradient(160deg, var(--mr-plum-deep), var(--mr-plum))", color: "#F7F6F8" }}
    >
      <span className="font-display font-bold" style={{ fontSize: large ? 72 : 44 }} aria-hidden>
        {initial}
      </span>
      <span className="px-2 text-center text-xs opacity-80">Demo artwork — connects with TMDB</span>
    </span>
  );
}
