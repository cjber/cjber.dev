import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

export const runtime = 'nodejs'

// Cache for 1 hour
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000

interface CommitStats {
  date: string
  additions: number
  deletions: number
  net: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')
  const username = searchParams.get('username') || 'cjber'
  
  // Check cache
  const cacheKey = `${username}-${days}`
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Returning cached data for ${cacheKey}`)
    return NextResponse.json(cached.data)
  }
  
  const token = process.env.GITHUB_TOKEN
  
  if (!token) {
    return NextResponse.json(
      { error: 'GitHub token not configured' },
      { status: 500 }
    )
  }

  const octokit = new Octokit({ auth: token })

  try {
    console.log('Fetching GitHub stats with targeted approach...')
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Get user's recently pushed repositories (including org repos)
    // affiliation parameter gets repos from orgs you're a member of
    const recentRepos = await octokit.paginate(
      octokit.repos.listForAuthenticatedUser,
      {
        per_page: 100,
        sort: 'pushed',
        affiliation: 'owner,collaborator,organization_member'
      }
    )
    
    // Filter to repos pushed within our date range
    const activeRepos = recentRepos.filter(repo => {
      const pushedAt = new Date(repo.pushed_at!)
      return pushedAt >= startDate
    })
    
    console.log(`Found ${activeRepos.length} recently active repositories`)
    console.log(`Top 5 active repos: ${activeRepos.slice(0, 5).map(r => `${r.owner.login}/${r.name}`).join(', ')}`)
    
    // Aggregate commit stats by date
    const statsMap = new Map<string, { additions: number; deletions: number }>()
    let processedRepos = 0
    
    // Process repos in smaller batches to avoid rate limiting
    const BATCH_SIZE = 5 // Increased batch size for faster processing
    for (let i = 0; i < activeRepos.length; i += BATCH_SIZE) {
      const batch = activeRepos.slice(i, i + BATCH_SIZE)
      
      await Promise.all(batch.map(async (repo) => {
        try {
          // First check if user has commits in this repo in the time range
          const commits = await octokit.repos.listCommits({
            owner: repo.owner.login,
            repo: repo.name,
            author: username,
            since: startDate.toISOString(),
            until: endDate.toISOString(),
            per_page: 100
          })
          
          if (commits.data.length === 0) {
            console.log(`No commits by ${username} in ${repo.name}`)
            return
          }
          
          console.log(`Processing ${commits.data.length} commits in ${repo.owner.login}/${repo.name}`)
          processedRepos++
          
          // Get detailed stats for each commit
          for (const commit of commits.data) {
            try {
              const detail = await octokit.repos.getCommit({
                owner: repo.owner.login,
                repo: repo.name,
                ref: commit.sha
              })
              
              if (detail.data.stats) {
                const date = new Date(commit.commit.author!.date!).toISOString().split('T')[0]
                const existing = statsMap.get(date) || { additions: 0, deletions: 0 }
                statsMap.set(date, {
                  additions: existing.additions + detail.data.stats.additions,
                  deletions: existing.deletions + detail.data.stats.deletions
                })
              }
            } catch (error) {
              console.warn(`Failed to get stats for commit ${commit.sha}`)
            }
          }
        } catch (error) {
          console.warn(`Failed to process ${repo.name}:`, error)
        }
      }))
      
      console.log(`Processed batch ${Math.floor(i/BATCH_SIZE) + 1}`)
    }
    
    console.log(`Processed ${processedRepos} repositories with your commits`)
    
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
        repositoriesProcessed: processedRepos,
        repositoriesChecked: activeRepos.length
      }
    }
    
    // Cache the result
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