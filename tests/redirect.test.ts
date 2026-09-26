import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeRedirect } from '../lib/redirect.ts'

test('keeps https URLs on phareim.no and its subdomains', () => {
  assert.equal(safeRedirect('https://phareim.no/'), 'https://phareim.no/')
  assert.equal(safeRedirect('https://reader.phareim.no/feeds?x=1#top'), 'https://reader.phareim.no/feeds?x=1#top')
  assert.equal(safeRedirect('https://a.b.phareim.no'), 'https://a.b.phareim.no/')
})

test('drops other hosts, other schemes and look-alikes', () => {
  assert.equal(safeRedirect('https://evil.com/'), null)
  assert.equal(safeRedirect('http://reader.phareim.no/'), null)
  assert.equal(safeRedirect('https://phareim.no.evil.com/'), null)
  assert.equal(safeRedirect('https://evilphareim.no/'), null)
  assert.equal(safeRedirect('https://reader.phareim.no@evil.com/'), null)
  assert.equal(safeRedirect('javascript:alert(1)'), null)
  assert.equal(safeRedirect('data:text/html,hi'), null)
})

test('relative paths and junk mean no redirect', () => {
  assert.equal(safeRedirect('/feeds'), null)
  assert.equal(safeRedirect('//evil.com/'), null)
  assert.equal(safeRedirect(''), null)
  assert.equal(safeRedirect(undefined), null)
  assert.equal(safeRedirect(['https://phareim.no/']), null)
  assert.equal(safeRedirect('not a url'), null)
})
