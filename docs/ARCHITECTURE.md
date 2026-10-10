# Architecture (movgator-web)

Two experiences, one codebase, separated by route group (URLs unaffected):

```
src/app/(marketing)/  conventional site: /, /features, /how-it-works,
                   /about, /use-cases, /faq, /contact, /get-started,
                   /privacy, /terms (+ shared nav/footer, per-page SEO;
                   NO manifest, NO service worker, NO install prompts)
src/app/(app)/   the product: /home, /discover, /title/[id], /dice,
                   /movie-night[/[id]], /profile, /watchlist, /onboarding,
                   /offline (collapsible sectioned sidebar on desktop with
                   persisted state, icon rail on tablet, floating iOS-style
                   tab bar on phones, top search on desktop, install card,
                   SW registration, manifest)
src/components/  design-system primitives + movie components
src/lib/         typed api client, auth context, theme (no-flash)
public/          manifest, sw.js (shell-only cache, registered by the
                 app layout only), brand/ (source SVGs), icons/ (PNGs
                 rasterized FROM the brand SVG — no redrawn artwork)
```

## Rules

- Marketing promotes; the app delivers. No website chrome (headers, menus,
  footers) inside `(app)`; no app behavior (SW, install, tab bar) inside
  `(marketing)`.
- Server Components by default; client islands for interactivity.
- Typed central API client (`src/lib/api.ts`); cookies + CSRF handled there.
- Provider keys never enter the browser bundle. Ratings labelled by source.
- Icons: Phosphor via `@phosphor-icons/react` in client components;
  Server Components must import from `@phosphor-icons/react/dist/ssr`
  (the root entry is CSR-only and breaks prerender).
- Themes: light/dark/system, OS default, persisted, no-flash inline script;
  toggle in marketing header + app Profile settings.
- PWA: manifest + icons; SW caches shell/static only, never `/api/*`;
  offline page; `display-mode: standalone` adjustments.
