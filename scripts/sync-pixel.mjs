// Copies the pixel look from phareim.no (the source; never edit the copies
// here): the stage, scenery, sprites and 5×7 font, the HTML panel CSS and
// the webfont. Run from the repo root: node scripts/sync-pixel.mjs [../phareim.no]
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'

const src = resolve(process.argv[2] ?? join(process.env.HOME, 'github/phareim.no'))
const sha = execFileSync('git', ['-C', src, 'rev-parse', '--short', 'HEAD']).toString().trim()
const files = [
  ['themes/base/pixel/stage.ts', 'pixel/stage.ts'],
  ['themes/base/pixel/scenery.ts', 'pixel/scenery.ts'],
  ['themes/base/pixel/sprites.ts', 'pixel/sprites.ts'],
  ['themes/zelda/render/font.ts', 'pixel/font.ts'],
  ['themes/base/pixel/pixel.css', 'pixel/pixel.css'],
]
for (const [from, to] of files) {
  let text = readFileSync(join(src, from), 'utf8')
  text = text.replaceAll("'../../zelda/render/font'", "'./font'")
  const note = to.endsWith('.css')
    ? `/* Vendored from phareim.no ${from} @ ${sha} by scripts/sync-pixel.mjs. Edit it there. */\n`
    : `// Vendored from phareim.no ${from} @ ${sha} by scripts/sync-pixel.mjs. Edit it there.\n`
  writeFileSync(to, note + text)
}
copyFileSync(join(src, 'public/fonts/neon-pixel.woff'), 'public/fonts/neon-pixel.woff')
console.log(`pixel look synced from phareim.no @ ${sha}`)
