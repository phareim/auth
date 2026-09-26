import { test } from 'node:test'
import assert from 'node:assert/strict'
import { corsOrigin } from '../lib/cors.ts'

test('reflects exact https origins on phareim.no', () => {
  assert.equal(corsOrigin('https://phareim.no'), 'https://phareim.no')
  assert.equal(corsOrigin('https://reader.phareim.no'), 'https://reader.phareim.no')
  assert.equal(corsOrigin('https://a.b.phareim.no'), 'https://a.b.phareim.no')
})

test('refuses everything else', () => {
  for (const origin of [
    'http://phareim.no',
    'https://evil.com',
    'https://phareim.no.evil.com',
    'https://evilphareim.no',
    'https://phareim.no/',
    'https://phareim.no:8443',
    'https://PHAREIM.NO',
    'null',
    '',
    undefined,
    null,
  ]) {
    assert.equal(corsOrigin(origin), null, String(origin))
  }
})
