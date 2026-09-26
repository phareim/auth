# auth.phareim.no

One sign-in page for the `*.phareim.no` apps. An app that needs a login sends
the browser here with `?redirect=<its URL>`; after sign-in or sign-up the
browser goes back there with a session.

auth-web owns no accounts and no data. Reader (`reader-service`,
reader.phareim.no) is the identity provider: it keeps the users, the sessions
and the `session_token` cookie (`Domain=.phareim.no`, httpOnly, 30 days).
auth-web is a themed front for Reader's `/api/auth/*` endpoints.

## The page

`https://auth.phareim.no/?redirect=…&theme=…&mode=…`

| Param | Values | Effect |
|---|---|---|
| `redirect` | an `https://` URL on `phareim.no` or a subdomain | Where to go after success. Anything else (other hosts, `http:`, relative paths) is ignored, so the page can't be used as an open redirect. The page says "Continue to &lt;host&gt;". |
| `theme` | `neon`, `paper` | Forces the look. Without it the redirect decides (below). |
| `mode` | `signin` (default), `signup` | Which form opens first. |

On load the page asks `/api/session`. With a session and a redirect it goes
straight on; with a session and no redirect it shows "Signed in" with a
sign-out button. Sign-up is invite-only: the form asks for the invite phrase,
which Reader checks against its own secret (`NUXT_INVITE_CODE`); auth-web never
knows it. Password rule (Reader's): at least 12 characters, a letter and a digit.

### Themes

The theme is picked on the server, so the first paint is right. A small
toggle in the bottom-right corner flips it.

- **paper** (the house Tufte look, light and dark by system setting) for
  `reader`, `do`, `write`, `taste`, `dagbok`, `wiki`, `agora`, `inbox`,
  `stats`, `health`, `chat`, `bil` and `15` (`<name>.phareim.no`).
- **neon** (phareim.no's pixel look, dark only) for everything else:
  phareim.no, the games, radio, jam, and no redirect at all.

The list lives in `lib/theme.ts`. Each theme's CSS is scoped to its class on
`<html>` (`theme-neon`, `theme-paper`).

The neon look is Neon Shrine's, the same as the town on phareim.no: the form
sits in its dialog box (`.px-box`, `.px-btn`) with the 5×7 pixel font, over
the town at dusk drawn on the pixel stage (`components/neon/DuskScene.vue`).
`pixel/` holds the stage, scenery, sprites, font and panel CSS, and
`public/fonts/neon-pixel.woff` the webfont, all copied from phareim.no by
`node scripts/sync-pixel.mjs`. phareim.no is where the look is developed;
edit it there and sync, never the copies here. Typed text and prose use
Space Mono, since the pixel font has capitals only.

Paper: `assets/css/tufte.css` is do-web's Tufte stylesheet and
`components/tufte/` the four Tufte primitives rewritten as plain scoped CSS.

## API

All under `https://auth.phareim.no/api/`. Each call is relayed to Reader's
`/api/auth/<same name>` with the JSON body, the browser's `cookie` header and
`cf-connecting-ip`; Reader's status, JSON body and every `Set-Cookie` header
come back unchanged. Errors are trimmed to `{ statusCode, statusMessage }`.

| Route | Body | Returns |
|---|---|---|
| `POST /api/sign-in` | `{ email, password }` | `{ user }`, sets the session cookie |
| `POST /api/sign-up` | `{ email, password, name?, inviteCode }` | `{ user }`, sets the session cookie |
| `POST /api/sign-out` | none | `{ success: true }`, clears the cookie |
| `GET /api/session` | none | `{ user: { id, email, name, image } \| null }` (Reader's `features` are left out) |

`sign-in` and `sign-up` accept `application/json` only (415 otherwise): a
cross-site HTML form can't send JSON without a preflight, so nobody can sign
a visitor into another account from their own page. Reader's rate limit (10
failed sign-ins per email in 10 minutes, then 429) applies as usual.

**CORS.** Other apps call `GET /api/session` and `POST /api/sign-out` with
`credentials: 'include'`. The `Origin` is reflected only when it is exactly
`https://phareim.no` or `https://<sub>.phareim.no` (default port), with
`Access-Control-Allow-Credentials: true`, `Vary: Origin`, methods
`GET, POST, OPTIONS` and header `content-type`. `OPTIONS` answers 204. Rule
and tests: `lib/cors.ts`, `tests/cors.test.ts`.

```js
// From phareim.no: who is signed in?
const { user } = await fetch('https://auth.phareim.no/api/session', { credentials: 'include' }).then(r => r.json())
// Send someone to sign in and back:
location.href = 'https://auth.phareim.no/?redirect=' + encodeURIComponent(location.href)
```

## Reader over a service binding

`wrangler.toml` binds `READER` to the `reader-service` Worker. Server routes
call `env.READER.fetch(new Request('https://reader.phareim.no/api/auth/…'))`
(env from `event.context.cloudflare.env`, see `server/utils/reader.ts`), so the
call never leaves Cloudflare and needs no secret. There is no D1 binding and
no Worker secret.

In `nuxt dev` there is no binding, so the same URL is fetched over the
internet. That reaches the real Reader, but its cookie is for `.phareim.no`
and the browser drops it on localhost: signing in locally shows the answer
(errors, `{ user }`) but no session sticks.

## Run and deploy

```sh
npm install
npm test        # node --test: safeRedirect, themeFor, corsOrigin
npm run dev     # http://localhost:3050
npm run build   # Nitro cloudflare-module preset → .output/
```

Push to `main` deploys: `.github/workflows/deploy.yml` runs `npm ci`, the
tests, the build, then `wrangler deploy` (wrangler 4.128.0) with the repo
secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The Worker is
`auth-web` on the custom domain `auth.phareim.no`. `reader-service` must be
deployed in the same account for the binding to resolve.

## What would make it redundant

- Reader's own `/login` page learning the two themes and the `?theme=` rule;
  then apps could send people there and this Worker could go.
- Identity moving off Reader (Cloudflare Access, a real IdP): the sign-in
  page would belong to whatever replaces it.

Retiring it: point apps back at their new login, delete the `auth-web`
Worker and its custom domain, and mark it retired in
`~/github/sleeper/docs/agent-environment-reference.md`.
