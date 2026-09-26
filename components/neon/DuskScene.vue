<template><canvas ref="canvas" class="dusk-scene" aria-hidden="true" /></template>

<script setup lang="ts">
/**
 * The neon look's backdrop: phareim.no's town at dusk on the pixel stage
 * (pixel/, vendored from phareim.no). Striped sun, violet ridges, a row of
 * houses with lit windows, lamps, the rose path. Windows and lamps glow
 * through the light map; reduced motion draws one frame.
 */
import { createPixelStage, makeCanvas, type PixelStage } from '~/pixel/stage'
import { DUSK, drawStars, hash2, paintGrass, paintHouse, paintLamp, paintRidge, paintSky, paintSun, paintTreeLine, rect } from '~/pixel/scenery'

const canvas = ref<HTMLCanvasElement | null>(null)
let stage: PixelStage | null = null
let back: HTMLCanvasElement | null = null
let sunLayer: HTMLCanvasElement | null = null
let front: HTMLCanvasElement | null = null
let horizon = 0
let lamps: { x: number; y: number; c: string }[] = []
let windows: { x: number; y: number }[] = []
let observer: ResizeObserver | undefined
let raf = 0
let reduced = false

function layout(W: number, H: number): void {
  const portrait = W < H
  horizon = Math.round(H * (portrait ? 0.72 : 0.68))
  const ground = horizon + Math.max(12, Math.round(H * 0.07))

  back = makeCanvas(W, H)
  paintSky(back.getContext('2d')!, W, horizon)

  sunLayer = makeCanvas(W, H)
  const sr = Math.max(12, Math.min(30, Math.round(Math.min(W, H) * 0.14)))
  paintSun(sunLayer.getContext('2d')!, Math.round(W * (portrait ? 0.7 : 0.78)), horizon - Math.round(sr * 0.3), sr)

  front = makeCanvas(W, H)
  const g = front.getContext('2d')!
  const farH = Math.max(10, Math.round(H * 0.1))
  paintRidge(g, W, horizon + 2, farH, ground, DUSK.ridgeFar, DUSK.ridgeFarRim, 6, 0.7)
  paintRidge(g, W, horizon + 6, Math.round(farH * 0.55), ground, DUSK.ridge, DUSK.ridgeRim, 17, 0.3)
  paintTreeLine(g, 0, W, ground, Math.max(5, Math.round(H * 0.045)), 9)

  paintGrass(g, 0, W, ground, H, 7)

  // The town: houses along the road, the widest one Petter's.
  windows = []
  const size = portrait ? 1 : 1.25
  const spots = portrait ? [0.04, 0.58] : [0.03, 0.2, 0.62, 0.8]
  spots.forEach((t, i) => {
    const w = Math.round((i % 2 ? 26 : 34) * size)
    const h = Math.round((i % 2 ? 22 : 26) * size)
    windows.push(...paintHouse(g, Math.round(W * t), ground + 1, w, h, i + 3))
  })

  // The rose road along the front, lamps on its edge.
  const roadY = ground + Math.round((H - ground) * 0.4)
  for (let y = roadY; y < roadY + 7 && y < H; y++) {
    for (let x = 0; x < W; x++) {
      if ((y === roadY || y === roadY + 6) && hash2(x, y, 3) < 0.45) continue
      rect(g, hash2(x >> 1, y, 4) > 0.86 ? DUSK.pathL : hash2(x, y >> 1, 5) < 0.12 ? DUSK.pathD : DUSK.path, x, y)
    }
  }
  lamps = []
  const colors = ['#ff2fa0', '#2ff3ff']
  for (let x = 14, i = 0; x < W - 4; x += portrait ? 46 : 64, i++) {
    lamps.push({ ...paintLamp(g, x, roadY, 12, colors[i % 2]), c: colors[i % 2] })
  }
}

function draw(time: number): void {
  const s = stage
  if (!s || !back || !front || !sunLayer) return
  const t = reduced ? 0 : time / 1000
  const g = s.begin()
  g.drawImage(back, 0, 0)
  drawStars(g, s.vw, horizon - 8, t, 1, 23)
  g.drawImage(sunLayer, 0, 0)
  s.emitImage(sunLayer)
  g.drawImage(front, 0, 0)
  const flick = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 7)
  for (const l of lamps) s.light(l.x, l.y, 26, l.c, 0.9 * flick)
  for (const w of windows) s.light(w.x, w.y, 9, '#ffd23f', 0.55)
  s.present({ ambient: '#8f84c4' })
  if (!reduced) raf = requestAnimationFrame(draw)
}

function fit(width: number, height: number): void {
  if (!stage || !width || !height) return
  stage.resize(width, height, devicePixelRatio || 1, width < 600 ? 150 : 240, 150)
  layout(stage.vw, stage.vh)
  if (reduced) draw(0)
}

onMounted(() => {
  const c = canvas.value
  if (!c) return
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  stage = createPixelStage(c)
  fit(c.clientWidth, c.clientHeight)
  observer = new ResizeObserver(([entry]) => fit(entry.contentRect.width, entry.contentRect.height))
  observer.observe(c)
  if (!reduced) raf = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  observer?.disconnect()
})
</script>

<style scoped>
.dusk-scene {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  background: #0b0616;
}
</style>
