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
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startTimestamp = Math.floor(startDate.getTime() / 1000)

  // Collect weekly data points sorted by timestamp
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
