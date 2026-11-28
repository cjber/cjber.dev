// GitHub's API returns 502s and drops connections, sometimes for minutes.
// Retry those with a growing backoff (GitHub's guidance for 5xx), and pass
// every other response, or the last 5xx once the delays run out, back so the
// caller decides what an error means.
export const RETRY_DELAYS_MS = [5_000, 15_000, 45_000, 90_000, 180_000]

type Deps = {
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  delays?: readonly number[]
}

export async function githubFetch(url: string, init?: RequestInit, deps: Deps = {}): Promise<Response> {
  const {
    fetchImpl = fetch,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    delays = RETRY_DELAYS_MS,
  } = deps
  for (let attempt = 0; ; attempt++) {
    const delay = delays[attempt]
    try {
      const response = await fetchImpl(url, init)
      if (response.status < 500 || delay === undefined) return response
      console.warn(`GitHub ${response.status} for ${url}, retrying in ${delay / 1000}s`)
    } catch (error) {
      if (delay === undefined) throw error
      console.warn(`${String(error)} for ${url}, retrying in ${delay / 1000}s`)
    }
    await sleep(delay)
  }
}
