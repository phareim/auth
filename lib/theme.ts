// Which look the page wears. An explicit ?theme= wins; otherwise the
// redirect's app decides: the Tufte apps get paper, everything else
// (phareim.no, the games, radio, jam, no redirect at all) gets neon.

import { safeRedirect } from './redirect.ts'

export type Theme = 'neon' | 'paper'

export const THEMES: readonly Theme[] = ['neon', 'paper']

// <name>.phareim.no apps drawn in the house Tufte look.
export const PAPER_APPS: readonly string[] = [
  'reader', 'do', 'write', 'taste', 'dagbok', 'wiki', 'agora',
  'inbox', 'stats', 'health', 'chat', 'bil', '15',
]

export function isTheme(value: unknown): value is Theme {
  return value === 'neon' || value === 'paper'
}

export function themeFor({ theme, redirect }: { theme?: unknown; redirect?: unknown }): Theme {
  if (isTheme(theme)) return theme
  const target = safeRedirect(redirect)
  if (!target) return 'neon'
  const host = new URL(target).hostname
  const app = host.endsWith('.phareim.no') ? host.slice(0, -'.phareim.no'.length) : ''
  return PAPER_APPS.includes(app) ? 'paper' : 'neon'
}
