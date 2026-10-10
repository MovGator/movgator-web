# Local development (movgator-web)

```powershell
npm install
Copy-Item .env.example .env.local   # API base http://localhost:8000
npm run dev                          # http://localhost:3000
npx tsc --noEmit; npm run build; npx playwright test
```

- The API (`movgator-backend`, sibling folder) must run at
  `NEXT_PUBLIC_API_BASE_URL` during `npm run build` (pages prerender
  against it) and during e2e.
- e2e uses the installed Chrome channel (`channel: "chrome"` in
  `playwright.config.ts`); no separate browser download.
- PWA: `npm run build && npm start`, then DevTools → Application →
  Manifest/Service Workers; test offline via the Offline page.
- Themes: toggle in the marketing header and app Profile settings;
  persisted `localStorage mr-theme`, OS default, no-flash inline script.
