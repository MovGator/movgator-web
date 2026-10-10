/* eslint-disable @next/next/no-img-element */
/** Supplied brand assets from /brand (copied verbatim, never edited).
 *
 * Verified mapping (do not infer from filenames alone):
 * - movgator-logo-primary.svg: transparent, plum wordmark → light surfaces.
 * - movgator-logo-secondary.svg: transparent, cream wordmark → dark surfaces.
 * - movgator-icon-logo-light.svg: gold ticket → compact light placements.
 * - movgator-icon-logo-dark.svg: #070209 ticket → compact dark placements.
 * - movgator-text-logo-*.svg: baked-background banners; unsuitable for
 *   responsive themed surfaces, so reserved (not used in UI).
 */

function themedPair(lightSrc: string, darkSrc: string, width: number, height: number, label: string) {
  return (
    <span className="brand-mark" role="img" aria-label={label}>
      <img className="only-light" src={lightSrc} width={width} height={height} alt="" aria-hidden="true" />
      <img className="only-dark" src={darkSrc} width={width} height={height} alt="" aria-hidden="true" />
    </span>
  );
}

/** Full brand mark for headers, sidebars, footers and auth pages. */
export function Logo({ height = 30 }: { height?: number }) {
  const width = Math.round((height * 2612) / 416);
  return themedPair(
    "/brand/movgator-logo-primary.svg",
    "/brand/movgator-logo-secondary.svg",
    width,
    height,
    "MovGator"
  );
}

/** Compact icon for rails, install cards and icon-only placements. */
export function LogoIcon({ size = 30 }: { size?: number }) {
  return (
    <span className="brand-mark" role="img" aria-label="MovGator">
      <img
        className="only-light rounded-md"
        src="/brand/movgator-icon-logo-light.svg"
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
      />
      <img
        className="only-dark rounded-md"
        src="/brand/movgator-icon-logo-dark.svg"
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
      />
    </span>
  );
}
