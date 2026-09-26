import { test } from 'node:test'
import assert from 'node:assert/strict'
import { themeFor, PAPER_APPS } from '../lib/theme.ts'

test('an explicit theme wins', () => {
  assert.equal(themeFor({ theme: 'paper' }), 'paper')
  assert.equal(themeFor({ theme: 'neon', redirect: 'https://reader.phareim.no/' }), 'neon')
  assert.equal(themeFor({ theme: 'paper', redirect: 'https://phareim.no/' }), 'paper')
})

test('an unknown theme falls back to inference', () => {
  assert.equal(themeFor({ theme: 'sepia', redirect: 'https://do.phareim.no/' }), 'paper')
  assert.equal(themeFor({ theme: 'PAPER' }), 'neon')
})

test('the Tufte apps get paper', () => {
  for (const app of PAPER_APPS) {
    assert.equal(themeFor({ redirect: `https://${app}.phareim.no/some/path` }), 'paper', app)
  }
})

test('everything else gets neon', () => {
  assert.equal(themeFor({}), 'neon')
  assert.equal(themeFor({ redirect: 'https://phareim.no/?theme=galaga' }), 'neon')
  assert.equal(themeFor({ redirect: 'https://radio.phareim.no/' }), 'neon')
  assert.equal(themeFor({ redirect: 'https://jam.phareim.no/' }), 'neon')
  assert.equal(themeFor({ redirect: 'https://x.reader.phareim.no/' }), 'neon')
  // An unsafe redirect is ignored, so it can't pick a theme either.
  assert.equal(themeFor({ redirect: 'https://reader.evil.com/' }), 'neon')
  assert.equal(themeFor({ redirect: 'http://reader.phareim.no/' }), 'neon')
})
