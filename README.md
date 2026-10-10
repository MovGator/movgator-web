# MovGator web (movgator-web)

Next.js 15 App Router + React 19 + strict TypeScript + Tailwind. Two
experiences in one codebase, separated by route group:

- `src/app/(marketing)/` — conventional multi-page site (Home, Features,
  How it works, About, Use cases, FAQ, Contact, Get started, Privacy,
  Terms). Shared nav/footer, per-page SEO. **No manifest, no service
  worker, no install prompts.**
- `src/app/(app)/` — the product (Home feed, Discover, Titles, Dice,
  Movie Night, Onboarding, Profile, Offline). App shell with floating
  iOS-style tab bar on phones, icon rail on tablet/desktop, install card,
  service-worker registration and web manifest.

The API contract lives in the companion `movgator-backend` repo
(`docs/API.md` there); this repo never contains provider keys or
server secrets. Brand source SVGs live outside this repo; rasterized
copies ship under `public/brand/` and `public/icons/`.

## Quick start (no credentials)

```powershell
npm install
Copy-Item .env.example .env.local   # API base http://localhost:8000
npm run dev                          # http://localhost:3000
```

Backend must run during `npm run build` (pages prerender against it) and
during `npx playwright test` (uses installed Chrome channel).

## Verify

```powershell
npx tsc --noEmit
npm run build
npx playwright test
```

## Docs

- `docs/ARCHITECTURE.md` — route groups, app shell, PWA scoping, themes.
- `docs/DEPLOYMENT.md` — Vercel + env.
- `docs/LOCAL_DEVELOPMENT.md` — dev, PWA testing, e2e notes.
- Auth/catalogue/Avatar decisions affecting this repo are recorded in
  `movgator-backend/docs/ADR/`; the API surface in
  `movgator-backend/docs/API.md`.
