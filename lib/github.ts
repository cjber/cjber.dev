import { Octokit } from '@octokit/rest'

const USERNAME = 'cjber'

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
  w: number // unix timestamp
  a: number // additions
  d: number // deletions
  c: number // commits
}

function buildResponse(allWeekly: Map<number, { additions: number; deletions: number }>, days: number) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startTimestamp = Math.floor(startDate.getTime() / 1000)
  const today = new Date().toISOString().split('T')[0]

  const statsMap = new Map<string, { additions: number; deletions: number }>()

  for (const [weekTimestamp, stats] of allWeekly) {
    if (weekTimestamp < startTimestamp) continue
    // GitHub stats/contributors returns weekly data (Sunday-aligned)
    // Attribute the whole week to the week start date
    const date = new Date(weekTimestamp * 1000).toISOString().split('T')[0]
    const existing = statsMap.get(date) || { additions: 0, deletions: 0 }
    statsMap.set(date, {
      additions: existing.additions + stats.additions,
      deletions: existing.deletions + stats.deletions,
    })
  }

  // Build filled daily array
  const filledStats: CommitStats[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    if (dateStr === today) {
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }

    // Find the week this date belongs to (stats are weekly, keyed by week start)
    const existing = statsMap.get(dateStr)

    filledStats.push({
      date: dateStr,
      additions: existing?.additions || 0,
      deletions: existing?.deletions || 0,
      net: (existing?.additions || 0) - (existing?.deletions || 0),
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  const nonZero = filledStats.filter(s => s.additions > 0 || s.deletions > 0)

  return {
    stats: filledStats,
    summary: {
      totalAdditions: nonZero.reduce((sum, s) => sum + s.additions, 0),
      totalDeletions: nonZero.reduce((sum, s) => sum + s.deletions, 0),
      totalNet: nonZero.reduce((sum, s) => sum + s.net, 0),
      daysWithCommits: nonZero.length,
      repositories: 0, // filled below
    },
  }
}

export async function fetchGitHubStats(days: number = 30) {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GitHub token not configured')
  }

  const octokit = new Octokit({ auth: token })

  // Collect weekly stats from all repos using the efficient contributors stats endpoint
  // This returns pre-aggregated weekly data - 1 API call per repo instead of N per commit
  const allWeekly = new Map<number, { additions: number; deletions: number }>()
  let reposWithData = 0

  // Get user's recently pushed repos
  const userRepos = await octokit.paginate(
    octokit.repos.listForAuthenticatedUser,
    {
      per_page: 100,
      sort: 'pushed',
      affiliation: 'owner,collaborator,organization_member',
    }
  )

  const maxDays = 365
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - maxDays)

  const recentRepos = userRepos.filter(repo => {
    const pushedAt = new Date(repo.pushed_at!)
    return pushedAt >= cutoff
  })

  // Merge with known repos
  const reposToCheck = [...KNOWN_REPOS]
  for (const repo of recentRepos) {
    if (!reposToCheck.some(r => r.owner === repo.owner.login && r.name === repo.name)) {
      reposToCheck.push({ owner: repo.owner.login, name: repo.name })
    }
  }

  // Fetch contributor stats in parallel batches
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

        // Find the user's stats
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

  const result = buildResponse(allWeekly, days)
  result.summary.repositories = reposWithData
  return result
}
