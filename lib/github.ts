import { Octokit } from '@octokit/rest'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

const USERNAME = 'cjber'
const CACHE_DIR = path.join(process.cwd(), '.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'github-stats.json')
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

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
  // week timestamp -> {additions, deletions}
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

async function readCache(): Promise<CachedWeeklyData | null> {
  try {
    const raw = await readFile(CACHE_FILE, 'utf-8')
    const cached: CachedWeeklyData = JSON.parse(raw)
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached
    }
  } catch {
    // No cache or invalid
  }
  return null
}

async function writeCache(data: CachedWeeklyData) {
  try {
    await mkdir(CACHE_DIR, { recursive: true })
    await writeFile(CACHE_FILE, JSON.stringify(data))
  } catch {
    // Non-fatal
  }
}

function cacheToMap(cached: CachedWeeklyData): Map<number, { additions: number; deletions: number }> {
  const map = new Map<number, { additions: number; deletions: number }>()
  for (const [key, value] of Object.entries(cached.weeks)) {
    map.set(Number(key), value)
  }
  return map
}

async function fetchFromGitHub(): Promise<{ allWeekly: Map<number, { additions: number; deletions: number }>; repositories: number }> {
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

  // Write to cache
  const cacheData: CachedWeeklyData = {
    timestamp: Date.now(),
    repositories: reposWithData,
    weeks: Object.fromEntries(allWeekly),
  }
  await writeCache(cacheData)

  return { allWeekly, repositories: reposWithData }
}

export async function fetchGitHubStats(days: number = 90) {
  // Try cache first
  const cached = await readCache()
  if (cached) {
    const allWeekly = cacheToMap(cached)
    return buildResponse(allWeekly, days, cached.repositories)
  }

  // Fetch fresh data from GitHub
  const { allWeekly, repositories } = await fetchFromGitHub()
  return buildResponse(allWeekly, days, repositories)
}
