// Where to send the browser after a sign-in. Same rules as Reader's login
// page: only https URLs on phareim.no or a subdomain, so ?redirect= can't be
// used as an open redirect. Relative paths mean nothing here (auth has no
// app pages of its own), so they count as "no redirect".

export function isPhareimHost(hostname: string): boolean {
  return hostname === 'phareim.no' || hostname.endsWith('.phareim.no')
}

export function safeRedirect(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw === '') return null
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || !isPhareimHost(url.hostname)) return null
  return url.href
}
