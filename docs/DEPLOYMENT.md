# Deployment (movgator-web → Vercel)

No logins performed and no resources created — config + steps only.
`vercel.json` is included. Backend deploys separately from
`movgator-backend`.

- Import repo, framework Next.js, `npm run build`.
- Env: `NEXT_PUBLIC_API_BASE_URL=https://<api-domain>`,
  `NEXT_PUBLIC_APP_URL=https://<web-domain>`. Rebuild after changing
  `NEXT_PUBLIC_*` (inlined at build).
- Custom domain via DNS (Cloudflare CNAME); never cache `/api/*` at the
  edge. Re-verify hobby-plan bandwidth/build limits at launch.
