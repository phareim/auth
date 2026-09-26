import { corsOrigin, CORS_HEADERS, CORS_METHODS } from '~/lib/cors'

// Other *.phareim.no apps call the API with credentials: 'include'. The
// origin is reflected only when corsOrigin() accepts it.
export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return

  const origin = corsOrigin(getRequestHeader(event, 'origin'))
  setResponseHeader(event, 'vary', 'Origin')
  if (origin) {
    setResponseHeader(event, 'access-control-allow-origin', origin)
    setResponseHeader(event, 'access-control-allow-credentials', 'true')
  }

  if (event.method === 'OPTIONS') {
    if (origin) {
      setResponseHeader(event, 'access-control-allow-methods', CORS_METHODS)
      setResponseHeader(event, 'access-control-allow-headers', CORS_HEADERS)
      setResponseHeader(event, 'access-control-max-age', '600')
    }
    setResponseStatus(event, 204)
    return ''
  }
})
