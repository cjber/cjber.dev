import assert from 'node:assert/strict'
import { test } from 'node:test'
import { githubFetch } from './github-fetch'

const quiet = { sleep: async () => {} }
const respond = (status: number) => new Response(String(status), { status })

function sequence(...steps: Array<Response | Error>) {
  const calls: number[] = []
  const fetchImpl = (async () => {
    const step = steps[calls.length]
    calls.push(calls.length)
    if (step instanceof Error) throw step
    return step
  }) as typeof fetch
  return { fetchImpl, calls }
}

test('retries a 502 until the API recovers', async () => {
  const { fetchImpl, calls } = sequence(respond(502), respond(502), respond(200))
  const slept: number[] = []
  const res = await githubFetch('https://x', undefined, {
    fetchImpl,
    sleep: async (ms) => void slept.push(ms),
    delays: [1, 2, 3],
  })
  assert.equal(res.status, 200)
  assert.equal(calls.length, 3)
  assert.deepEqual(slept, [1, 2])
})

test('returns the last 5xx once the delays run out', async () => {
  const { fetchImpl, calls } = sequence(respond(502), respond(503), respond(502))
  const res = await githubFetch('https://x', undefined, { ...quiet, fetchImpl, delays: [1, 1] })
  assert.equal(res.status, 502)
  assert.equal(calls.length, 3)
})

test('retries a dropped connection and rethrows it after the last delay', async () => {
  const dropped = new Error('socket hang up')
  const ok = sequence(dropped, respond(200))
  assert.equal((await githubFetch('https://x', undefined, { ...quiet, fetchImpl: ok.fetchImpl, delays: [1] })).status, 200)
  const bad = sequence(dropped, dropped)
  await assert.rejects(githubFetch('https://x', undefined, { ...quiet, fetchImpl: bad.fetchImpl, delays: [1] }), dropped)
})

test('does not retry a 4xx', async () => {
  const { fetchImpl, calls } = sequence(respond(404))
  const res = await githubFetch('https://x', undefined, { ...quiet, fetchImpl, delays: [1, 1] })
  assert.equal(res.status, 404)
  assert.equal(calls.length, 1)
})
