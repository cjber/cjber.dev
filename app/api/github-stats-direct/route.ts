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

// Known active repos to always check
const KNOWN_REPOS = [
  { owner: 'thirdweb-dev', name: 'nebula' },
  { owner: 'thirdweb-dev', name: 'nebula-web' },
  { owner: 'thirdweb-dev', name: 'js' },
  { owner: 'thirdweb-dev', name: 'engine' },
  { owner: 'cjber', name: 'cjber.dev' },
  { owner: 'cjber', name: 'dotfiles' }
]

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
    console.log('Fetching GitHub stats with direct repo approach...')
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // First get all user's repos
    const userRepos = await octokit.paginate(
      octokit.repos.listForAuthenticatedUser,
      {
        per_page: 100,
        sort: 'pushed',
        affiliation: 'owner,collaborator,organization_member'
      }
    )
    
    // Filter to recently pushed and add known repos
    const recentRepos = userRepos.filter(repo => {
      const pushedAt = new Date(repo.pushed_at!)
      return pushedAt >= startDate
    })
    
    // Combine with known repos (deduplicated)
    const reposToCheck = [...KNOWN_REPOS]
    for (const repo of recentRepos) {
      if (!reposToCheck.some(r => r.owner === repo.owner.login && r.name === repo.name)) {
        reposToCheck.push({ owner: repo.owner.login, name: repo.name })
      }
    }
    
    console.log(`Checking ${reposToCheck.length} repositories for commits`)
    
    // Aggregate commit stats by date
    const statsMap = new Map<string, { additions: number; deletions: number }>()
    const processedCommits = new Set<string>() // Track commit SHAs to avoid duplicates
    let processedRepos = 0
    let totalCommits = 0
    
    // Process repos in batches
    const BATCH_SIZE = 5
    for (let i = 0; i < reposToCheck.length; i += BATCH_SIZE) {
      const batch = reposToCheck.slice(i, i + BATCH_SIZE)
      
      await Promise.all(batch.map(async (repo) => {
        try {
          // Get ALL commits for this repo using pagination
          const commits = await octokit.paginate(
            octokit.repos.listCommits,
            {
              owner: repo.owner,
              repo: repo.name,
              author: username,
              since: startDate.toISOString(),
              until: endDate.toISOString(),
              per_page: 100
            }
          )
          
          if (commits.length === 0) {
            return
          }
          
          console.log(`Found ${commits.length} commits in ${repo.owner}/${repo.name}`)
          processedRepos++
          
          // Get detailed stats for each commit
          let newCommitsInRepo = 0
          for (const commit of commits) {
            // Skip if we've already processed this commit SHA (duplicate from renamed/moved repo)
            if (processedCommits.has(commit.sha)) {
              console.log(`Skipping duplicate commit ${commit.sha.substring(0, 7)} in ${repo.owner}/${repo.name}`)
              continue
            }
            
            processedCommits.add(commit.sha)
            newCommitsInRepo++
            
            try {
              const detail = await octokit.repos.getCommit({
                owner: repo.owner,
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
          
          totalCommits += newCommitsInRepo
          if (newCommitsInRepo < commits.length) {
            console.log(`  → ${newCommitsInRepo} new commits (${commits.length - newCommitsInRepo} duplicates)`)
          }
        } catch (error: any) {
          // Only log if it's not a 404 (repo doesn't exist or no access)
          if (error.status !== 404) {
            console.warn(`Failed to process ${repo.owner}/${repo.name}:`, error.message)
          }
        }
      }))
      
      console.log(`Processed batch ${Math.floor(i/BATCH_SIZE) + 1}`)
    }
    
    console.log(`Total: ${processedRepos} repos with commits, ${totalCommits} total commits`)
    
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
    // Exclude today to avoid incomplete data
    const today = new Date().toISOString().split('T')[0]
    const filledStats: CommitStats[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Skip today's incomplete data
      if (dateStr === today) {
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }
      
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
        totalCommits: totalCommits
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