// CORS for auth's API: other *.phareim.no apps (the phareim.no portal, first
// of all) ask "who is signed in?" and "sign me out" with credentials. Only an
// exact https origin on phareim.no or a subdomain, on the default port, is
// reflected; anything else gets no CORS headers and the browser blocks it.

import { isPhareimHost } from './redirect.ts'

export function corsOrigin(origin: unknown): string | null {
  if (typeof origin !== 'string' || origin === '') return null
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || url.port !== '' || !isPhareimHost(url.hostname)) return null
  // An Origin header is scheme://host only: no path, no userinfo, no trailing slash.
  return url.origin === origin ? origin : null
}

export const CORS_METHODS = 'GET, POST, OPTIONS'
export const CORS_HEADERS = 'content-type'
