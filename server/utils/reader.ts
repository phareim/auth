import type { H3Event } from 'h3'

// Reader (reader-service) owns the accounts, the sessions and the
// session_token cookie. auth-web only relays: in production over the READER
// service binding (Worker to Worker, no public hop); in `nuxt dev`, where
// there is no binding, over the internet to the same URL.
const READER_ORIGIN = 'https://reader.phareim.no'

interface ServiceBinding {
  fetch(request: Request): Promise<Response>
}

function readerBinding(event: H3Event): ServiceBinding | undefined {
  return (event.context as any).cloudflare?.env?.READER
}

export async function callReader(
  event: H3Event,
  path: 'sign-in' | 'sign-up' | 'sign-out' | 'session',
  body?: Record<string, unknown>,
): Promise<Response | null> {
  const binding = readerBinding(event)
  const headers = new Headers({ accept: 'application/json' })
  const cookie = getRequestHeader(event, 'cookie')
  if (cookie) headers.set('cookie', cookie)
  // Reader logs the client IP next to failed attempts. Only over the binding:
  // Cloudflare's edge sets this header itself on a public request.
  const ip = getRequestHeader(event, 'cf-connecting-ip')
  if (binding && ip) headers.set('cf-connecting-ip', ip)
  if (body) headers.set('content-type', 'application/json')

  const request = new Request(`${READER_ORIGIN}/api/auth/${path}`, {
    method: body ? 'POST' : path === 'sign-out' ? 'POST' : 'GET',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  try {
    return binding ? await binding.fetch(request) : await fetch(request)
  } catch {
    return null
  }
}

// Pass Reader's answer back: its status, every Set-Cookie header one by one
// (joining them breaks the cookie), and the JSON body. Errors are trimmed to
// { statusCode, statusMessage } so the page has one shape to read.
export async function relay(
  event: H3Event,
  response: Response | null,
  shape: (data: any) => unknown = (data) => data,
): Promise<unknown> {
  setResponseHeader(event, 'cache-control', 'no-store')
  if (!response) return fail(event, 502, "Can't reach Reader right now")

  for (const cookie of response.headers.getSetCookie()) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }

  let data: any
  try {
    data = await response.json()
  } catch {
    return fail(event, 502, 'Reader answered with something unexpected')
  }

  if (!response.ok) {
    return fail(event, response.status, data?.statusMessage || data?.message || 'Something went wrong')
  }
  setResponseStatus(event, response.status)
  return shape(data)
}

function fail(event: H3Event, statusCode: number, statusMessage: string) {
  setResponseStatus(event, statusCode)
  return { statusCode, statusMessage }
}

// A cross-site HTML form can POST urlencoded bodies without a CORS preflight;
// it can't send application/json. Requiring JSON keeps login CSRF out.
export async function readJson(event: H3Event): Promise<Record<string, unknown> | null> {
  const type = getRequestHeader(event, 'content-type') || ''
  if (!type.toLowerCase().startsWith('application/json')) return null
  try {
    const body = await readBody(event)
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {}
  } catch {
    return {}
  }
}

export function pick(body: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of keys) if (body[key] !== undefined) out[key] = body[key]
  return out
}

export function needsJson(event: H3Event) {
  return fail(event, 415, 'Send JSON')
}
