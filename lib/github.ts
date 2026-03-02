import { Octokit } from '@octokit/rest'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

const USERNAME = 'cjber'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Disk cache: works at build time, persists across cold starts in some environments
const CACHE_PATHS = [
  path.join(process.cwd(), '.cache', 'github-stats.json'),
  '/tmp/github-stats.json',
]

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
}

function buildResponse(allWeekly: Map<number, { additions: number; deletions: number }>, days: number, repositories: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startTimestamp = Math.floor(startDate.getTime() / 1000)

  const weeks: CommitStats[] = []
  const sortedEntries = Array.from(allWeekly.entries()).sort((a, b) => a[0] - b[0])

  for (const [weekTimestamp, stats] of sortedEntries) {
    if (weekTimestamp < startTimestamp) continue
    weeks.push({
      date: new Date(weekTimestamp * 1000).toISOString().split('T')[0],
      additions: stats.additions,
      deletions: stats.deletions,
      net: stats.additions - stats.deletions,
    })
  }

  const activeWeeks = weeks.filter(s => s.additions > 0 || s.deletions > 0)

  return {
    stats: weeks,
    summary: {
      totalAdditions: activeWeeks.reduce((sum, s) => sum + s.additions, 0),
      totalDeletions: activeWeeks.reduce((sum, s) => sum + s.deletions, 0),
      totalNet: activeWeeks.reduce((sum, s) => sum + s.net, 0),
      activeWeeks: activeWeeks.length,
      repositories,
    },
  }
}

async function readDiskCache(): Promise<CachedWeeklyData | null> {
  for (const cachePath of CACHE_PATHS) {
    try {
      const raw = await readFile(cachePath, 'utf-8')
      return JSON.parse(raw) as CachedWeeklyData
    } catch {
      // Try next path
    }
  }
  return null
}

async function writeDiskCache(data: CachedWeeklyData) {
  for (const cachePath of CACHE_PATHS) {
    try {
      await mkdir(path.dirname(cachePath), { recursive: true })
      await writeFile(cachePath, JSON.stringify(data))
      return
    } catch {
      // Try next path
    }
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

async function fetchFromGitHub(): Promise<CachedWeeklyData> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GitHub token not configured')
  }

  const octokit = new Octokit({ auth: token })
  const allWeekly = new Map<number, { additions: number; deletions: number }>()
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
        const { data: contributors } = await octokit.repos.getContributorsStats({
          owner: repo.owner,
          repo: repo.name,
        })

        if (!Array.isArray(contributors)) return

        const userStats = contributors.find(
          (c) => c.author?.login?.toLowerCase() === USERNAME.toLowerCase()
        )

        if (!userStats?.weeks) return

        reposWithData++

        for (const week of userStats.weeks as WeeklyData[]) {
          if (week.a === 0 && week.d === 0) continue
          const existing = allWeekly.get(week.w) || { additions: 0, deletions: 0 }
          allWeekly.set(week.w, {
            additions: existing.additions + week.a,
            deletions: existing.deletions + week.d,
          })
        }
      } catch {
        // Skip repos we can't access
      }
    }))
  }

  const cacheData: CachedWeeklyData = {
    timestamp: Date.now(),
    repositories: reposWithData,
    weeks: Object.fromEntries(allWeekly),
  }

  // Persist to memory + disk
  memoryCache = cacheData
  await writeDiskCache(cacheData)

  return cacheData
}

export async function fetchGitHubStats(days: number = 90) {
  // 1. Check in-memory cache (fresh)
  const mem = getCache()
  if (mem && isFresh(mem)) {
    return buildResponse(cacheToMap(mem), days, mem.repositories)
  }

  // 2. Check disk cache (fresh)
  const disk = await readDiskCache()
  if (disk && isFresh(disk)) {
    memoryCache = disk
    return buildResponse(cacheToMap(disk), days, disk.repositories)
  }

  // 3. Try fetching from GitHub
  const staleCache = mem || disk
  try {
    const fresh = await fetchFromGitHub()
    return buildResponse(cacheToMap(fresh), days, fresh.repositories)
  } catch (error) {
    // 4. If GitHub fails (rate limit, network), serve stale cache
    if (staleCache) {
      console.warn('GitHub fetch failed, serving stale cache:', error)
      return buildResponse(cacheToMap(staleCache), days, staleCache.repositories)
    }
    throw error
  }
}
