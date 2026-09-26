import { safeRedirect } from '~/lib/redirect'
import { themeFor, type Theme } from '~/lib/theme'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
}

export type Mode = 'signin' | 'signup'
// form: nobody signed in (or not known yet) · signed-in: a session, no redirect
// · leaving: a session and a redirect, the browser is on its way.
export type Stage = 'form' | 'signed-in' | 'leaving'

export const PASSWORD_HINT = 'At least 12 characters, with a letter and a digit.'

/** Page state shared by both themes. One instance per request, kept in useState. */
export function useAuthFlow() {
  const url = useRequestURL()
  const params = url.searchParams

  const theme = useState<Theme>('theme', () => themeFor({ theme: params.get('theme'), redirect: params.get('redirect') }))
  const mode = useState<Mode>('mode', () => (params.get('mode') === 'signup' ? 'signup' : 'signin'))
  const target = useState<string | null>('target', () => safeRedirect(params.get('redirect')))
  const stage = useState<Stage>('stage', () => 'form')
  const user = useState<AuthUser | null>('user', () => null)
  const error = useState<string | null>('error', () => null)
  const busy = useState<boolean>('busy', () => false)

  const fields = useState('fields', () => ({ name: '', email: '', password: '', inviteCode: '' }))

  const targetHost = computed(() => (target.value ? new URL(target.value).host : null))
  const displayName = computed(() => user.value?.name || user.value?.email || '')

  // Keep the address bar in step with the page, so a reload lands on the same view.
  function syncUrl(key: 'theme' | 'mode', value: string, fallback: string) {
    if (!import.meta.client) return
    const next = new URL(window.location.href)
    if (value === fallback && key === 'mode') next.searchParams.delete(key)
    else next.searchParams.set(key, value)
    window.history.replaceState(window.history.state, '', next)
  }

  function setMode(next: Mode) {
    mode.value = next
    error.value = null
    syncUrl('mode', next, 'signin')
  }

  function toggleTheme() {
    theme.value = theme.value === 'neon' ? 'paper' : 'neon'
    syncUrl('theme', theme.value, '')
  }

  function leave() {
    if (!target.value) return
    stage.value = 'leaving'
    window.location.assign(target.value)
  }

  async function post(path: string, body?: object) {
    const response = await fetch(`/api/${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.statusMessage || 'Something went wrong. Try again.')
    return data
  }

  async function checkSession() {
    try {
      const response = await fetch('/api/session', { credentials: 'same-origin', headers: { accept: 'application/json' } })
      if (!response.ok) return
      const data = await response.json()
      if (!data?.user) return
      user.value = data.user
      if (target.value) leave()
      else stage.value = 'signed-in'
    } catch {
      // Reader unreachable: leave the form up; submitting will say so.
    }
  }

  async function submit() {
    if (busy.value) return
    busy.value = true
    error.value = null
    const f = fields.value
    try {
      const data = mode.value === 'signup'
        ? await post('sign-up', { email: f.email, password: f.password, name: f.name || undefined, inviteCode: f.inviteCode })
        : await post('sign-in', { email: f.email, password: f.password })
      user.value = data.user ?? null
      f.password = ''
      f.inviteCode = ''
      if (target.value) leave()
      else stage.value = 'signed-in'
    } catch (err: any) {
      error.value = err?.message || 'Something went wrong. Try again.'
    } finally {
      busy.value = false
    }
  }

  async function signOut() {
    if (busy.value) return
    busy.value = true
    error.value = null
    try {
      await post('sign-out')
      user.value = null
      stage.value = 'form'
      mode.value = 'signin'
    } catch (err: any) {
      error.value = err?.message || 'Could not sign out. Try again.'
    } finally {
      busy.value = false
    }
  }

  return {
    theme, mode, target, targetHost, stage, user, displayName, error, busy, fields,
    setMode, toggleTheme, checkSession, submit, signOut,
  }
}
