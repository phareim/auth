# AGENTS.md

auth.phareim.no: one sign-in page for the `*.phareim.no` apps, Worker
`auth-web`. Nuxt 3 on Cloudflare (`cloudflare-module` preset). It holds no
data: `/api/*` relays to Reader (`reader-service`) over the `READER` service
binding. The README has the params, API, CORS rule and theme map.

## Commands

- `npm test`: the pure rules in `lib/` (node --test, Node 22 type stripping)
- `npm run dev`: dev server on port 3050 (relays to the live Reader over the internet)
- `npm run build`: production build into `.output/`

## Layout

```
app.vue                 one page; sets html class theme-neon / theme-paper
composables/useAuthFlow state and actions shared by both themes
components/NeonView.vue neon theme (Neon Dreams); components/neon/NeonHorizon.vue the backdrop
components/PaperView.vue paper theme (Tufte); components/tufte/ the four primitives
lib/                    safeRedirect, themeFor, corsOrigin (framework-free, tested)
server/api/             sign-in, sign-up, sign-out, session: relays to Reader
server/middleware/cors  CORS for /api/*
server/utils/reader.ts  the service-binding call and the response relay
```

## Rules

- Reader owns accounts, sessions and the invite phrase. Never store user
  data here and never add a D1 binding; change Reader instead.
- Pass every `Set-Cookie` from Reader through one by one (`getSetCookie()`).
- Keep each theme's CSS under its `html.theme-*` class so they don't bleed.
- The paper app list is in `lib/theme.ts`; a new Tufte app goes there with a test.
- Screenshots: one headless browser at a time on Sleeper
  (`flock /tmp/claude-1000/chrome.lock …`), and close it when done.
- Deploy is push to `main` (GitHub Actions + wrangler).
