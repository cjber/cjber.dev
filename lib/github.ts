import { Octokit } from '@octokit/rest'

const USERNAME = 'cjber' // fallback

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

// In-memory cache: survives across requests within the same server instance
let memoryCache: CachedWeeklyData | null = null

const KNOWN_REPOS = [
  { owner: 'thirdweb-dev', name: 'nebula' },
  { owner: 'thirdweb-dev', name: 'nebula-web' },
  { owner: 'thirdweb-dev', name: 'js' },
  { owner: 'thirdweb-dev', name: 'engine' },
  { owner: 'cjber', name: 'cjber.dev' },
  { owner: 'cjber', name: 'dotfiles' },
]

interface CommitStats {
  date: string
  additions: number
  deletions: number
  net: number
  [repo: string]: string | number // per-repo net values keyed by repo name
}

interface WeeklyData {
  w: number
  a: number
  d: number
  c: number
}

interface CachedWeeklyData {
  timestamp: number
  repositories: number
  weeks: Record<string, { additions: number; deletions: number }>
  repoWeeks?: Record<string, Record<string, { additions: number; deletions: number }>>
}

function buildResponse(
  allWeekly: Map<number, { additions: number; deletions: number }>,
  days: number,
  repositories: number,
  repoWeeks?: Map<string, Map<number, { additions: number; deletions: number }>>,
) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startTimestamp = Math.floor(startDate.getTime() / 1000)

  const weeks: CommitStats[] = []
  const repoNames = new Set<string>()
  const sortedEntries = Array.from(allWeekly.entries()).sort((a, b) => a[0] - b[0])

  for (const [weekTimestamp, stats] of sortedEntries) {
    if (weekTimestamp < startTimestamp) continue
    const row: CommitStats = {
      date: new Date(weekTimestamp * 1000).toISOString().split('T')[0],
      additions: stats.additions,
      deletions: stats.deletions,
      net: stats.additions - stats.deletions,
    }
    if (repoWeeks) {
      for (const [repoName, weekMap] of repoWeeks) {
        const repoStats = weekMap.get(weekTimestamp)
        if (repoStats) {
          row[repoName] = repoStats.additions - repoStats.deletions
          repoNames.add(repoName)
        }
      }
    }
    weeks.push(row)
  }

  const activeWeeks = weeks.filter(s => s.additions > 0 || s.deletions > 0)

  return {
    stats: weeks,
    repos: Array.from(repoNames),
    summary: {
      totalAdditions: activeWeeks.reduce((sum, s) => sum + s.additions, 0),
      totalDeletions: activeWeeks.reduce((sum, s) => sum + s.deletions, 0),
      totalNet: activeWeeks.reduce((sum, s) => sum + s.net, 0),
      activeWeeks: activeWeeks.length,
      repositories,
    },
  }
}

function getCache(): CachedWeeklyData | null {
  if (memoryCache) return memoryCache
  return null
}

function isFresh(cached: CachedWeeklyData): boolean {
  return Date.now() - cached.timestamp < CACHE_TTL
}

function cacheToMap(cached: CachedWeeklyData): Map<number, { additions: number; deletions: number }> {
  const map = new Map<number, { additions: number; deletions: number }>()
  for (const [key, value] of Object.entries(cached.weeks)) {
    map.set(Number(key), value)
  }
  return map
}

function cacheToRepoMap(cached: CachedWeeklyData): Map<string, Map<number, { additions: number; deletions: number }>> | undefined {
  if (!cached.repoWeeks) return undefined
  const map = new Map<string, Map<number, { additions: number; deletions: number }>>()
  for (const [repoName, weeks] of Object.entries(cached.repoWeeks)) {
    const weekMap = new Map<number, { additions: number; deletions: number }>()
    for (const [key, value] of Object.entries(weeks)) {
      weekMap.set(Number(key), value)
    }
    map.set(repoName, weekMap)
  }
  return map
}

async function fetchFromGitHub(retry = false): Promise<CachedWeeklyData> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GitHub token not configured')
  }

  const octokit = new Octokit({ auth: token })
  const allWeekly = new Map<number, { additions: number; deletions: number }>()
  const repoWeekly = new Map<string, Map<number, { additions: number; deletions: number }>>()
  let reposWithData = 0

  const userRepos = await octokit.paginate(
    octokit.repos.listForAuthenticatedUser,
    {
      per_page: 100,
      sort: 'pushed',
      affiliation: 'owner,collaborator,organization_member',
    }
  )

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 365)

  const recentRepos = userRepos.filter(repo => {
    const pushedAt = new Date(repo.pushed_at!)
    return pushedAt >= cutoff
  })

  const reposToCheck = [...KNOWN_REPOS]
  for (const repo of recentRepos) {
    if (!reposToCheck.some(r => r.owner === repo.owner.login && r.name === repo.name)) {
      reposToCheck.push({ owner: repo.owner.login, name: repo.name })
    }
  }

  const BATCH_SIZE = 10
  for (let i = 0; i < reposToCheck.length; i += BATCH_SIZE) {
    const batch = reposToCheck.slice(i, i + BATCH_SIZE)

    await Promise.all(batch.map(async (repo) => {
      try {
        let contributors: unknown = null
        const maxAttempts = retry ? 4 : 1
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const response = await octokit.repos.getContributorsStats({
            owner: repo.owner,
            repo: repo.name,
          })
          if (response.status === 202 && attempt < maxAttempts - 1) {
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
            continue
          }
          contributors = response.data
          break
        }

        if (!Array.isArray(contributors)) return

        const userStats = contributors.find(
          (c) => c.author?.login?.toLowerCase() === USERNAME.toLowerCase()
        )

        if (!userStats?.weeks) return

        reposWithData++
        const repoName = repo.name

        for (const week of userStats.weeks as WeeklyData[]) {
          if (week.a === 0 && week.d === 0) continue
          const existing = allWeekly.get(week.w) || { additions: 0, deletions: 0 }
          allWeekly.set(week.w, {
            additions: existing.additions + week.a,
            deletions: existing.deletions + week.d,
          })
          if (!repoWeekly.has(repoName)) repoWeekly.set(repoName, new Map())
          const repoMap = repoWeekly.get(repoName)!
          const repoExisting = repoMap.get(week.w) || { additions: 0, deletions: 0 }
          repoMap.set(week.w, {
            additions: repoExisting.additions + week.a,
            deletions: repoExisting.deletions + week.d,
          })
        }
      } catch {
        // Skip repos we can't access
      }
    }))
  }

  // Serialize repoWeekly for cache
  const repoWeeksObj: Record<string, Record<string, { additions: number; deletions: number }>> = {}
  for (const [repoName, weekMap] of repoWeekly) {
    repoWeeksObj[repoName] = Object.fromEntries(weekMap)
  }

  const cacheData: CachedWeeklyData = {
    timestamp: Date.now(),
    repositories: reposWithData,
    weeks: Object.fromEntries(allWeekly),
    repoWeeks: repoWeeksObj,
  }

  memoryCache = cacheData

  return cacheData
}

export async function fetchGitHubStats(days: number = 90, retry = false) {
  // 1. Check in-memory cache (fresh)
  const mem = getCache()
  if (mem && isFresh(mem)) {
    return buildResponse(cacheToMap(mem), days, mem.repositories, cacheToRepoMap(mem))
  }

  // 2. Try fetching from GitHub
  const staleCache = mem
  try {
    const fresh = await fetchFromGitHub(retry)
    return buildResponse(cacheToMap(fresh), days, fresh.repositories, cacheToRepoMap(fresh))
  } catch (error) {
    // 4. If GitHub fails (rate limit, network), serve stale cache
    if (staleCache) {
      console.warn('GitHub fetch failed, serving stale cache:', error)
      return buildResponse(cacheToMap(staleCache), days, staleCache.repositories, cacheToRepoMap(staleCache))
    }
    throw error
  }
}
