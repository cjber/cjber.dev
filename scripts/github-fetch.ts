// GitHub's API returns the odd 502 or drops a connection. Retry those, and
// pass every other response back so the caller decides what an error means.
const DELAYS_MS = [5_000, 20_000]

export async function githubFetch(url: string, init?: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const delay = DELAYS_MS[attempt]
    try {
      const response = await fetch(url, init)
      if (response.status < 500 || delay === undefined) return response
      console.warn(`GitHub ${response.status} for ${url}, retrying in ${delay / 1000}s`)
    } catch (error) {
      if (delay === undefined) throw error
      console.warn(`${String(error)} for ${url}, retrying in ${delay / 1000}s`)
    }
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}
