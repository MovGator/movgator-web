import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import type { Title } from "@/lib/types";
import { TitleActions } from "./actions";
import { PosterArt } from "@/components/PosterArt";
import { CertBadge, GenreChip, PosterRail } from "@/components/Movie";
import { BackButton } from "@/components/BackButton";
import { AppBar } from "@/components/AppBar";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const t = await api.title(id);
    return { title: `${t.title}${t.release_year ? ` (${t.release_year})` : ""}` };
  } catch {
    return { title: "Title not found" };
  }
}

export default async function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let t = null;
  try {
    t = await api.title(id);
  } catch {
    notFound();
  }
  if (!t) notFound();
  const rating =
    t.provider === "tmdb" && t.tmdb_rating != null
      ? { source: "TMDB community score", value: `${t.tmdb_rating.toFixed(1)} / 10` }
      : null;
  // Related: TMDB recommendations endpoint via the backend (genre
  // fallback server-side) — never hardcoded, always catalogue records.
  let related: Title[] = [];
  try {
    related = await api.related(id);
  } catch {
    related = [];
  }
  return (
    <article>
      <AppBar title={t.title} backFallback="/discover" />
      <div className="mb-4 hidden md:block">
        <BackButton fallback="/discover" />
      </div>

      <div className="title-hero">
        {t.backdrop_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.backdrop_url} alt="" aria-hidden="true" className="title-hero-bg" />
        ) : (
          <div
            className="title-hero-bg"
            aria-hidden="true"
            style={{ background: "linear-gradient(160deg, var(--mr-plum-deep), var(--mr-plum))" }}
          />
        )}
        <div className="title-hero-scrim">
          <PosterArt title={t} large />
          <div>
            <p className="muted text-sm font-semibold uppercase tracking-wide">
              {t.media_type === "anime" ? "Anime" : t.media_type} {t.release_year ? `· ${t.release_year}` : ""}
            </p>
            <h1 className="font-display mt-1 text-3xl font-extrabold md:text-4xl">{t.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.genres.map((g) => (
                <GenreChip key={g} label={g} />
              ))}
            </div>
            <dl className="mt-4 grid max-w-lg grid-cols-2 gap-3 text-sm">
              {t.runtime_min && (
                <div>
                  <dt className="muted">Runtime</dt>
                  <dd className="font-semibold">{Math.floor(t.runtime_min / 60) > 0 ? `${Math.floor(t.runtime_min / 60)}h ${t.runtime_min % 60}m` : `${t.runtime_min}m`}</dd>
                </div>
              )}
              {t.release_date && (
                <div>
                  <dt className="muted">Released</dt>
                  <dd className="font-semibold">{t.release_date}</dd>
                </div>
              )}
              {rating && (
                <div>
                  <dt className="muted">{rating.source}</dt>
                  <dd className="font-semibold">{rating.value}</dd>
                </div>
              )}
              {t.certification && (
                <div>
                  <dt className="muted">Rating</dt>
                  <dd className="font-semibold"><CertBadge certification={t.certification} /></dd>
                </div>
              )}
              {t.provenance === "seed" && (
                <div>
                  <dt className="muted">Catalogue</dt>
                  <dd className="font-semibold">Demo entry — live data connects with TMDB</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <p className="max-w-2xl leading-relaxed">{t.synopsis || "Synopsis not available yet."}</p>
      {t.trailer_key && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-bold">Trailer</h2>
          <div className="mt-2 aspect-video max-w-2xl overflow-hidden rounded-3xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${t.trailer_key}`}
              title={`Trailer for ${t.title}`}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      )}
      <div className="[&_p]:max-w-2xl">
        <TitleActions id={t.id} title={t.title} />
      </div>
      {related.length > 0 && (
        <PosterRail heading={`More like this${t.genres[0] ? ` (${t.genres[0]})` : ""}`} items={related} />
      )}
    </article>
  );
}
