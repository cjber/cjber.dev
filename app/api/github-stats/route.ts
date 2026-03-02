import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

interface CommitStats {
  date: string
  additions: number
  deletions: number
  net: number
}

interface RepoCommit {
  sha: string
  commit: {
    author: {
      date: string
    }
  }
  stats?: {
    additions: number
    deletions: number
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')
  const username = searchParams.get('username') || 'cjber'
  
  // Check cache first
  const cacheKey = `${username}-${days}`
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Returning cached data for ${cacheKey}`)
    return NextResponse.json(cached.data)
  }
  
  const token = process.env.GITHUB_TOKEN
  
  console.log('GitHub API route called - fetching fresh data')
  console.log('Token exists:', !!token)
  
  if (!token) {
    return NextResponse.json(
      { error: 'GitHub token not configured' },
      { status: 500 }
    )
  }

  const octokit = new Octokit({ auth: token })

  try {
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all repositories for the user
    console.log('Fetching repositories...')
    const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
      per_page: 100,
      sort: 'updated',
      affiliation: 'owner,collaborator,organization_member'
    })
    console.log(`Found ${repos.length} repositories`)

    // Aggregate commit stats by date
    const statsMap = new Map<string, { additions: number; deletions: number }>()

    // Process each repository
    for (const repo of repos) {
      try {
        // Get commits for this repository
        const commits = await octokit.paginate(
          octokit.repos.listCommits,
          {
            owner: repo.owner.login,
            repo: repo.name,
            since: startDate.toISOString(),
            until: endDate.toISOString(),
            author: username,
            per_page: 100
          },
          (response) => response.data as RepoCommit[]
        )

        // Fetch detailed stats for each commit
        for (const commit of commits) {
          try {
            const commitDetails = await octokit.repos.getCommit({
              owner: repo.owner.login,
              repo: repo.name,
              ref: commit.sha
            })

            const date = new Date(commit.commit.author.date).toISOString().split('T')[0]
            const stats = commitDetails.data.stats

            if (stats) {
              const existing = statsMap.get(date) || { additions: 0, deletions: 0 }
              statsMap.set(date, {
                additions: existing.additions + stats.additions,
                deletions: existing.deletions + stats.deletions
              })
            }
          } catch {
            // Skip commits that can't be fetched (e.g., deleted branches)
            console.warn(`Failed to fetch commit ${commit.sha} in ${repo.name}`)
          }
        }
      } catch {
        // Skip repositories that can't be accessed
        console.warn(`Failed to fetch commits for ${repo.name}`)
      }
    }

    // Convert map to sorted array
    const stats: CommitStats[] = Array.from(statsMap.entries())
      .map(([date, stats]) => ({
        date,
        additions: stats.additions,
        deletions: stats.deletions,
        net: stats.additions - stats.deletions
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Fill in missing dates with zero values
    const filledStats: CommitStats[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const existing = stats.find(s => s.date === dateStr)
      
      filledStats.push(existing || {
        date: dateStr,
        additions: 0,
        deletions: 0,
        net: 0
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const responseData = {
      stats: filledStats,
      summary: {
        totalAdditions: stats.reduce((sum, s) => sum + s.additions, 0),
        totalDeletions: stats.reduce((sum, s) => sum + s.deletions, 0),
        totalNet: stats.reduce((sum, s) => sum + s.net, 0),
        daysWithCommits: stats.filter(s => s.net !== 0).length,
        repositories: repos.length
      }
    }
    
    // Store in cache
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    })
    console.log(`Cached data for ${cacheKey}`)
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub statistics' },
      { status: 500 }
    )
  }
}