/* eslint-disable no-console */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local' })
loadEnv()

const USERNAME = process.env.GITHUB_USERNAME ?? 'cjber'
const TOKEN = process.env.GITHUB_TOKEN
const OUT_PATH = resolve(process.cwd(), 'lib/github-data.json')
const PINNED_REPOS: Array<{ owner: string; name: string }> = [
  { owner: 'thirdweb-dev', name: 'nebula' },
  { owner: 'thirdweb-dev', name: 'nebula-web' },
  { owner: 'thirdweb-dev', name: 'js' },
  { owner: 'thirdweb-dev', name: 'engine' },
  { owner: 'cjber', name: 'cjber.dev' },
  { owner: 'cjber', name: 'dotfiles' },
]

if (!TOKEN) {
  console.error('[fetch-github-data] GITHUB_TOKEN not set — writing empty snapshot')
  writeSnapshot({
    generatedAt: new Date().toISOString(),
    weeks: [],
    repoNames: [],
    calendar: { weeks: [], totalContributions: 0 },
  })
  process.exit(0)
}

type WeekStats = {
  date: string
  weekTimestamp: number
  additions: number
  deletions: number
  net: number
} & Record<string, string | number>

type CalendarDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
type CalendarWeek = { firstDay: string; days: CalendarDay[] }

type Snapshot = {
  generatedAt: string
  weeks: WeekStats[]
  repoNames: string[]
  calendar: { weeks: CalendarWeek[]; totalContributions: number }
}

function writeSnapshot(snapshot: Snapshot) {
  if (!existsSync(dirname(OUT_PATH))) mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 2) + '\n')
  console.log(`[fetch-github-data] wrote ${OUT_PATH} (${snapshot.weeks.length} weeks, ${snapshot.repoNames.length} repos)`)
}

const baseHeaders = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'cillian.dev-build',
}

async function gh<T>(url: string): Promise<{ status: number; data: T | null }> {
  const res = await fetch(url, { headers: baseHeaders })
  if (res.status === 202) return { status: 202, data: null }
  if (res.status === 204) return { status: 204, data: null }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub ${res.status} ${url}: ${text.slice(0, 200)}`)
  }
  return { status: res.status, data: (await res.json()) as T }
}

async function ghPaginate<T>(url: string): Promise<T[]> {
  const out: T[] = []
  let next: string | null = url
  while (next) {
    const res: Response = await fetch(next, { headers: baseHeaders })
    if (!res.ok) throw new Error(`GitHub ${res.status} ${next}`)
    const page = (await res.json()) as T[]
    out.push(...page)
    const link: string | null = res.headers.get('link')
    next = link ? parseNext(link) : null
  }
  return out
}

function parseNext(link: string): string | null {
  for (const part of link.split(',')) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/)
    if (match) return match[1]
  }
  return null
}

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...baseHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`GraphQL ${res.status}: ${await res.text()}`)
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> }
  if (json.errors?.length) throw new Error(`GraphQL errors: ${json.errors.map((e) => e.message).join('; ')}`)
  return json.data as T
}

const HISTORY_QUERY = `
  query($owner: String!, $name: String!, $userId: ID!, $since: GitTimestamp!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 100, author: {id: $userId}, since: $since, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes { committedDate additions deletions }
            }
          }
        }
      }
    }
  }
`

type Commit = { committedDate: string; additions: number; deletions: number }

async function fetchAuthoredCommits(
  owner: string,
  name: string,
  userId: string,
  sinceIso: string,
): Promise<Commit[] | null> {
  try {
    type HistoryResp = {
      repository: {
        defaultBranchRef: {
          target: {
            history: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: Commit[] }
          } | null
        } | null
      } | null
    }
    const all: Commit[] = []
    let cursor: string | null = null
    for (let page = 0; page < 10; page++) {
      const data: HistoryResp = await graphql<HistoryResp>(HISTORY_QUERY, {
        owner,
        name,
        userId,
        since: sinceIso,
        cursor,
      })
      const history = data.repository?.defaultBranchRef?.target?.history
      if (!history) return all
      all.push(...history.nodes)
      if (!history.pageInfo.hasNextPage) return all
      cursor = history.pageInfo.endCursor
    }
    return all
  } catch (err) {
    console.warn(`[stats] ${owner}/${name} failed: ${(err as Error).message}`)
    return null
  }
}

function mondayUtc(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dow = d.getUTCDay() // 0 Sun .. 6 Sat
  // GitHub stats endpoint used Sundays as week start; match that for parity.
  d.setUTCDate(d.getUTCDate() - dow)
  return Math.floor(d.getTime() / 1000)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type ListRepo = { owner: { login: string }; name: string; pushed_at: string | null; fork: boolean }

async function discoverRepos(): Promise<Array<{ owner: string; name: string }>> {
  const repos = await ghPaginate<ListRepo>(
    'https://api.github.com/user/repos?per_page=100&sort=pushed&affiliation=owner,collaborator,organization_member',
  )
  const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000
  const recent = repos.filter((r) => r.pushed_at && new Date(r.pushed_at).getTime() >= cutoff)
  const seen = new Set<string>()
  const out: Array<{ owner: string; name: string }> = []
  for (const repo of [...PINNED_REPOS, ...recent.map((r) => ({ owner: r.owner.login, name: r.name }))]) {
    const key = `${repo.owner}/${repo.name}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(repo)
  }
  console.log(`[discover] ${out.length} candidates (${PINNED_REPOS.length} pinned + ${out.length - PINNED_REPOS.length} recent)`)
  return out
}

async function fetchLocStats() {
  const repos = await discoverRepos()

  const userIdData = await graphql<{ user: { id: string } }>(
    'query($login: String!) { user(login: $login) { id } }',
    { login: USERNAME },
  )
  const userId = userIdData.user.id
  const sinceIso = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()

  const totals = new Map<number, { additions: number; deletions: number }>()
  const perRepo = new Map<string, Map<number, { additions: number; deletions: number }>>()
  let withData = 0

  const ingest = (repoName: string, commits: Commit[]) => {
    let touched = false
    for (const c of commits) {
      if (c.additions === 0 && c.deletions === 0) continue
      touched = true
      const w = mondayUtc(new Date(c.committedDate))
      const t = totals.get(w) ?? { additions: 0, deletions: 0 }
      totals.set(w, { additions: t.additions + c.additions, deletions: t.deletions + c.deletions })
      const repoMap = perRepo.get(repoName) ?? new Map()
      const r = repoMap.get(w) ?? { additions: 0, deletions: 0 }
      repoMap.set(w, { additions: r.additions + c.additions, deletions: r.deletions + c.deletions })
      perRepo.set(repoName, repoMap)
    }
    if (touched) withData++
  }

  console.log(`[stats] querying ${repos.length} repos via GraphQL history`)
  const BATCH = 8
  let completed = 0
  for (let i = 0; i < repos.length; i += BATCH) {
    const batch = repos.slice(i, i + BATCH)
    await Promise.all(
      batch.map(async (repo) => {
        const commits = await fetchAuthoredCommits(repo.owner, repo.name, userId, sinceIso)
        completed++
        if (completed % 20 === 0 || completed === repos.length) {
          console.log(`[stats] ${completed}/${repos.length}`)
        }
        if (commits && commits.length > 0) {
          ingest(repo.name, commits)
        }
      }),
    )
  }

  const cutoff = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000)
  const sorted = Array.from(totals.entries())
    .filter(([w]) => w >= cutoff)
    .sort(([a], [b]) => a - b)

  const repoNames = Array.from(perRepo.keys())
  const weeks: WeekStats[] = sorted.map(([w, agg]) => {
    const row: WeekStats = {
      date: new Date(w * 1000).toISOString().slice(0, 10),
      weekTimestamp: w,
      additions: agg.additions,
      deletions: agg.deletions,
      net: agg.additions - agg.deletions,
    }
    for (const repo of repoNames) {
      const v = perRepo.get(repo)?.get(w)
      if (v) row[repo] = v.additions - v.deletions
    }
    return row
  })

  return { weeks, repoNames, repoCount: withData }
}

type GraphQLCalendar = {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number
          weeks: Array<{
            firstDay: string
            contributionDays: Array<{ date: string; contributionCount: number; contributionLevel: string }>
          }>
        }
      }
    }
  }
}

const LEVEL_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

async function fetchCalendar() {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              firstDay
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...baseHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: USERNAME } }),
  })
  if (!res.ok) throw new Error(`GraphQL ${res.status}: ${await res.text()}`)
  const json = (await res.json()) as GraphQLCalendar
  const cal = json.data.user.contributionsCollection.contributionCalendar
  return {
    totalContributions: cal.totalContributions,
    weeks: cal.weeks.map((w) => ({
      firstDay: w.firstDay,
      days: w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVEL_MAP[d.contributionLevel] ?? 0,
      })),
    })),
  }
}

async function main() {
  const [loc, calendar] = await Promise.all([fetchLocStats(), fetchCalendar()])
  writeSnapshot({
    generatedAt: new Date().toISOString(),
    weeks: loc.weeks,
    repoNames: loc.repoNames,
    calendar,
  })
}

main().catch((err) => {
  console.error('[fetch-github-data] failed:', err)
  if (!existsSync(OUT_PATH)) {
    writeSnapshot({
      generatedAt: new Date().toISOString(),
      weeks: [],
      repoNames: [],
      calendar: { weeks: [], totalContributions: 0 },
    })
  }
  process.exit(0)
})
