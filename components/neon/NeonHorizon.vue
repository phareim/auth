<template>
  <canvas ref="canvas" class="horizon" aria-hidden="true" />
</template>

<script setup lang="ts">
// The Neon Dreams backdrop, ported from the design system's
// components/world/Horizon.jsx: stars, sky, striped sun, ridge, scrolling
// grid. Horizon at 62% of the height in landscape, 92% in portrait; no glow
// passes under 600px. prefers-reduced-motion gets one still frame.
const props = withDefaults(defineProps<{ speed?: number }>(), { speed: 0.6 })

const canvas = ref<HTMLCanvasElement | null>(null)

const SKY: [number, string][] = [[0, '#060310'], [0.55, '#0b0616'], [0.70, '#170a30'], [1, '#060310']]
const SUN: [number, string][] = [[0, '#ffd23f'], [0.55, '#ff6a3d'], [1, '#ff2fa0']]

function makeStars(n: number, seed = 7) {
  let s = seed
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  return Array.from({ length: n }, () => ({ x: rnd(), y: rnd(), r: rnd() < 0.6 ? 1 : rnd() < 0.5 ? 1.5 : 2, a: 0.4 + rnd() * 0.45 }))
}

function makeRidge(w: number, seed = 3) {
  let s = seed
  const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647
  const pts: { x: number; h: number }[] = []
  const step = 20
  for (let x = 0; x <= w + step; x += step) {
    const peak = (x / step) % 2 === 0
    pts.push({ x, h: peak ? 30 + rnd() * 50 : 5 + rnd() * 18 })
  }
  return pts
}

let raf = 0
let observer: ResizeObserver | null = null

onMounted(() => {
  const cv = canvas.value
  const ctx = cv?.getContext('2d')
  if (!cv || !ctx) return

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const stars = makeStars(220)
  let ridge: { x: number; h: number }[] | null = null
  let ridgeWidth = 0
  let last = performance.now()
  let scroll = 0
  let pulse = 0

  const resize = () => {
    const r = cv.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = Math.max(1, r.width * dpr)
    cv.height = Math.max(1, r.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (still) draw(performance.now())
  }

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const r = cv.getBoundingClientRect()
    const W = r.width
    const H = r.height
    if (!W || !H) return
    const portrait = H > W
    const glow = W >= 600
    const hy = H * (portrait ? 0.92 : 0.62)
    if (!still) {
      scroll = (scroll + dt * 0.35 * props.speed) % 1
      pulse += dt
    }
    const bright = 0.5 + (Math.sin(pulse * 2) * 0.5 + 0.5) * 0.15

    // sky
    const g = ctx.createLinearGradient(0, 0, 0, H)
    SKY.forEach(([o, c]) => g.addColorStop(o, c))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    // stars
    ctx.fillStyle = '#cfe9ff'
    for (const s of stars) {
      const y = s.y * hy
      if (y > hy - 4) continue
      ctx.globalAlpha = s.a * 0.85
      ctx.fillRect(Math.round(s.x * W), Math.round(y), s.r, s.r)
    }
    ctx.globalAlpha = 1

    // striped sun
    const R = Math.min(0.22 * W, 0.15 * H)
    const cx = W / 2
    const cy = hy - R * 0.35
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.1)
    halo.addColorStop(0, 'rgba(255,47,160,.44)')
    halo.addColorStop(1, 'rgba(255,47,160,0)')
    ctx.fillStyle = halo
    ctx.fillRect(cx - R * 2.1, cy - R * 2.1, R * 4.2, R * 4.2)
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.clip()
    ctx.globalAlpha = portrait ? 0.32 : 0.8
    const sg = ctx.createLinearGradient(0, cy - R, 0, cy + R)
    SUN.forEach(([o, c]) => sg.addColorStop(o, c))
    ctx.fillStyle = sg
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
    ctx.fillStyle = '#0b0616'
    ctx.globalAlpha = 1
    const bands = 13
    const start = cy - R * 0.25
    const span = R * 1.25
    for (let i = 0; i < bands; i++) {
      const t = i / bands
      const y = start + t * t * span
      const h = 1 + t * 9
      if (y + h < cy + R) ctx.fillRect(cx - R, y, R * 2, h)
    }
    ctx.restore()

    // mountain ridge
    if (!ridge || ridgeWidth !== W) {
      ridge = makeRidge(W)
      ridgeWidth = W
    }
    const pts = ridge
    const path = () => {
      ctx.beginPath()
      ctx.moveTo(0, hy)
      pts.forEach((p) => ctx.lineTo(p.x, hy - p.h * (H / 760)))
      ctx.lineTo(W, hy)
      ctx.closePath()
    }
    if (glow) {
      path()
      ctx.strokeStyle = 'rgba(255,47,160,.5)'
      ctx.lineWidth = 3
      ctx.shadowColor = '#ff2fa0'
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.shadowBlur = 0
    }
    path()
    ctx.fillStyle = '#120826'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,47,160,.65)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // perspective grid
    ctx.fillStyle = '#0b0616'
    ctx.fillRect(0, hy, W, H - hy)
    const rows = glow ? 5 : 4
    ctx.strokeStyle = '#ff2fa0'
    ctx.lineWidth = 1
    for (let i = 0; i < rows; i++) {
      const p = (i + scroll) / rows
      const y = hy + (H - hy) * p * p
      ctx.globalAlpha = (0.07 + p * 0.3) * bright
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }
    const rails = 9
    const vx = W / 2
    ctx.globalAlpha = 0.35 * bright
    for (let i = 0; i < rails; i++) {
      const k = i - (rails - 1) / 2
      ctx.beginPath()
      ctx.moveTo(vx + k * 9, hy)
      ctx.lineTo(vx + k * W * 0.143, H)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // the horizon line: the brightest line on screen
    ctx.strokeStyle = `rgba(255,47,160,${Math.min(1, 0.8 * (bright + 0.2))})`
    ctx.lineWidth = 2
    if (glow) {
      ctx.shadowColor = '#ff2fa0'
      ctx.shadowBlur = 8
    }
    ctx.beginPath()
    ctx.moveTo(0, hy)
    ctx.lineTo(W, hy)
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  observer = new ResizeObserver(resize)
  observer.observe(cv)
  resize()

  if (!still) {
    const loop = (now: number) => {
      draw(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  observer?.disconnect()
})
</script>

<style scoped>
.horizon {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
  background: #0b0616;
}
</style>
