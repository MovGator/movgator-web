import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import { api } from "@/lib/api";
import type { Title, FeedSection } from "@/lib/types";
import { MovieCard, PosterRail } from "@/components/Movie";
import { PosterArt } from "@/components/PosterArt";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { formatNumber } from "@/lib/i18n/format";

export const revalidate = 120;

async function getFeed() {
  try {
    return await api.feed(0, 12);
  } catch {
    return null;
  }
}

const MARQUEE_WORDS = ["Action", "Anime", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"];

function Marquee() {
  const row = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((half) => (
          <span key={half}>
            {row.map((w) => `${w}  •  `)}
          </span>
        ))}
      </div>
    </div>
  );
}

function Spotlight({ title, t }: { title: Title; t: (key: string) => string }) {
  return (
    <section aria-labelledby="spotlight" className="spotlight mt-10">
      {title.backdrop_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={title.backdrop_url} alt="" aria-hidden="true" className="spotlight-backdrop" />
      )}
      <div className="spotlight-scrim" aria-hidden="true" />
      <PosterArt title={title} />
      <div>
        <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
          {t("landing.spotlight")} · {title.media_type === "anime" ? t("landing.anime") : t("landing.film")}
        </p>
        <h2 id="spotlight" className="font-display mt-3 text-3xl font-extrabold md:text-4xl">
          {title.title}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          {[title.release_year, ...(title.genres.slice(0, 3)),
            title.provenance === "tmdb" && title.tmdb_rating != null
              ? `TMDB ${title.tmdb_rating.toFixed(1)}` : null].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-3 max-w-xl leading-relaxed">{title.synopsis}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/title/${title.id}`} className="mkt-cta !min-h-[48px] text-sm">
            <Play size={18} weight="fill" aria-hidden="true" /> {t("landing.viewTitle")}
          </Link>
          <Link href="/dice" className="inline-flex min-h-[48px] items-center rounded-full border px-6 text-sm font-semibold" style={{ borderColor: "var(--mr-line)" }}>
            {t("landing.cantChoose")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function LandingPage() {
  const feed = await getFeed();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = (key: string, vars?: Record<string, string>) => translate(dict, key, vars);
  const popular = (feed?.sections as FeedSection[] | undefined)?.find((s) => s.key === "popular")?.items ?? [];
  const preview = popular.slice(0, 8);
  const spotlight = popular[0];

  return (
    <div>
      <section aria-labelledby="hero" className="mkt-hero">
        <p className="mkt-eyebrow">
          {t("hero.eyebrow")}
        </p>
        <h1 id="hero" className="mkt-display mx-auto mt-5 max-w-4xl">
          {t("hero.titleA")}<span className="accent">{t("hero.accent")}</span>{t("hero.period")}
        </h1>
        <p className="mkt-subcopy mx-auto mt-4 max-w-xl text-lg" style={{ color: "var(--mr-ink-soft)" }}>
          {t("hero.sub")}
        </p>
        <div className="mkt-cta-row">
          <Link href="/home" className="mkt-cta">
            {t("hero.cta")}
          </Link>
          <Link href="/how-it-works" aria-label={t("nav.howItWorks")} className="mkt-cta-arrow">
            <ArrowRight size={20} weight="bold" aria-hidden="true" />
          </Link>
        </div>
        <dl className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="font-display text-2xl font-extrabold">{typeof feed?.total === "number" ? formatNumber(feed.total, locale) : "—"}</dt>
            <dd style={{ color: "var(--mr-ink-soft)" }}>{t("hero.statsBrowse")}</dd>
          </div>
          <div>
            <dt className="font-display text-2xl font-extrabold">{t("hero.statsDiceA")}</dt>
            <dd style={{ color: "var(--mr-ink-soft)" }}>{t("hero.statsDiceB")}</dd>
          </div>
          <div>
            <dt className="font-display text-2xl font-extrabold">{t("hero.statsLiveA")}</dt>
            <dd style={{ color: "var(--mr-ink-soft)" }}>{t("hero.statsLiveB")}</dd>
          </div>
        </dl>
      </section>

      <section aria-label={t("landing.tonightPicks")} className="cine-panel on-plum">
        {preview.length > 0 ? (
          <>
            <div className="rail" role="list">
              {preview.map((title) => (
                <div role="listitem" key={title.id}>
                  <MovieCard title={title} />
                </div>
              ))}
            </div>
            <p className="cine-caption mt-4 text-center">
              {t("landing.railCaption")}
            </p>
          </>
        ) : (
          <div className="flex aspect-video items-center justify-center p-8 text-center text-sm text-[#f7f6f8]/80">
            {t("landing.liveFallback")}
          </div>
        )}
      </section>

      <Marquee />

      {spotlight && <Spotlight title={spotlight} t={t} />}

      <section aria-labelledby="how" className="mr-card mt-10 grid gap-6 p-6 md:grid-cols-3 md:p-10">
        <div>
          <h2 id="how" className="font-display text-lg font-bold">{t("landing.how1t")}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {t("landing.how1d")}
          </p>
          <Link href="/discover" className="mt-2 inline-block text-sm font-semibold underline">{t("landing.how1l")}</Link>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">{t("landing.how2t")}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {t("landing.how2d")}
          </p>
          <Link href="/dice" className="mt-2 inline-block text-sm font-semibold underline">{t("landing.how2l")}</Link>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">{t("landing.how3t")}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {t("landing.how3d")}
          </p>
          <Link href="/movie-night" className="mt-2 inline-block text-sm font-semibold underline">{t("landing.how3l")}</Link>
        </div>
      </section>

      {feed && <PosterRail heading={t("landing.popular")} items={popular} href="/home" seeAllLabel={t("landing.seeAll")} />}

      <section aria-labelledby="nl-title" className="mt-12">
        <NewsletterForm variant="card" showDescription t={dict} />
      </section>

      <section aria-labelledby="explore" className="mt-12 grid gap-4 sm:grid-cols-3">
        <Link href="/features" className="mr-card block p-5">
          <h2 id="explore" className="font-display font-bold">{t("landing.exp1t")}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {t("landing.exp1d")}
          </p>
        </Link>
        <Link href="/use-cases" className="mr-card block p-5">
          <h2 className="font-display font-bold">{t("landing.exp2t")}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {t("landing.exp2d")}
          </p>
        </Link>
        <Link href="/about" className="mr-card block p-5">
          <h2 className="font-display font-bold">{t("landing.exp3t")}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
            {t("landing.exp3d")}
          </p>
        </Link>
      </section>
    </div>
  );
}
