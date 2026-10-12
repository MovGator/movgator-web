import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { api, type WatchProviders } from "@/lib/api";
import { regionFromAcceptLanguage } from "@/lib/region";
import type { Title } from "@/lib/types";
import { TitleActions } from "./actions";
import { PosterArt } from "@/components/PosterArt";
import { CertBadge, GenreChip, PosterRail } from "@/components/Movie";
import { MatureCover } from "@/components/MatureCover";
import type { WatchProvider } from "@/lib/api";

function WatchProviderChip({ provider }: { provider: WatchProvider }) {
  return (
    <>
      {provider.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={provider.logo_url} alt="" aria-hidden="true" width={28} height={28} className="rounded-full" loading="lazy" />
      ) : null}
      <span>{provider.name}</span>
    </>
  );
}
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
  // Legal viewing options for the viewer's region, detected from their
  // locale (US fallback). Any failure hides the section — never an error
  // state, never stale data.
  let watch: WatchProviders | null = null;
  try {
    const region = regionFromAcceptLanguage((await headers()).get("accept-language"));
    watch = await api.watchProviders(id, region);
  } catch {
    watch = null;
  }
  const watchGroups = watch
    ? ([
        ["Subscription", watch.flatrate],
        ["Rent", watch.rent],
        ["Buy", watch.buy],
      ] as const).filter(([, items]) => items.length > 0)
    : [];
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
          <MatureCover title={t}>
            <PosterArt title={t} large />
          </MatureCover>
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
      {watchGroups.length > 0 && watch && (
        <section className="mt-6 max-w-2xl" aria-labelledby="watch">
          <h2 id="watch" className="font-display text-lg font-bold">Where to watch</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            Legal streaming options in {watch.region} · data by TMDB
          </p>
          <div className="mt-3 grid gap-4">
            {watchGroups.map(([label, items]) => (
              <div key={label}>
                <h3 className="text-sm font-semibold">{label}</h3>
                <ul className="mt-2 flex flex-wrap gap-3">
                  {items.map((p) => (
                    <li key={p.name}>
                      {watch.link ? (
                        <Link
                          href={watch.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${p.name} (via TMDB)`}
                          className="mr-chip flex items-center gap-2 py-1.5 pl-1.5 pr-3 text-sm font-medium"
                        >
                          <WatchProviderChip provider={p} />
                        </Link>
                      ) : (
                        <span className="mr-chip flex items-center gap-2 py-1.5 pl-1.5 pr-3 text-sm font-medium">
                          <WatchProviderChip provider={p} />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {watch.link && (
            <p className="mt-3 text-sm">
              <Link href={watch.link} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                View all options on TMDB
              </Link>
            </p>
          )}
        </section>
      )}
      {related.length > 0 && (
        <PosterRail heading={`More like this${t.genres[0] ? ` (${t.genres[0]})` : ""}`} items={related} />
      )}
    </article>
  );
}
