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
    console.log('Fetching GitHub stats using GraphQL + selective detail fetching...')
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Use GraphQL to get commit activity overview
    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            commitContributionsByRepository(maxRepositories: 100) {
              repository {
                name
                owner {
                  login
                }
              }
              contributions(first: 100) {
                totalCount
                edges {
                  node {
                    occurredAt
                    commitCount
                  }
                }
              }
            }
          }
        }
      }
    `
    
    const graphqlResponse = await octokit.graphql(query, {
      username,
      from: startDate.toISOString(),
      to: endDate.toISOString()
    }) as any
    
    const contributionData = graphqlResponse.user?.contributionsCollection?.commitContributionsByRepository || []
    
    console.log(`Found ${contributionData.length} repositories with contributions in the last ${days} days`)
    
    // Get the repos with most activity to sample LOC/commit ratio
    const activeRepos = contributionData
      .filter((r: any) => r.contributions.totalCount > 0)
      .sort((a: any, b: any) => b.contributions.totalCount - a.contributions.totalCount)
      .slice(0, 5) // Sample top 5 most active repos
    
    console.log(`Sampling ${activeRepos.length} most active repos for accurate LOC/commit ratio`)
    
    // Sample commits from most active repos to get accurate LOC per commit
    let totalSampledAdditions = 0
    let totalSampledDeletions = 0
    let totalSampledCommits = 0
    
    for (const repoData of activeRepos) {
      const repo = repoData.repository
      try {
        // Get last 10 commits from this repo to sample
        const commits = await octokit.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          author: username,
          per_page: 10
        })
        
        // Get stats for these commits
        for (const commit of commits.data.slice(0, 5)) { // Sample 5 commits per repo
          try {
            const detail = await octokit.repos.getCommit({
              owner: repo.owner.login,
              repo: repo.name,
              ref: commit.sha
            })
            
            if (detail.data.stats) {
              totalSampledAdditions += detail.data.stats.additions
              totalSampledDeletions += detail.data.stats.deletions
              totalSampledCommits++
            }
          } catch {
            // Skip if can't fetch
          }
        }
      } catch {
        // Skip repo if can't access
      }
    }
    
    // Calculate average LOC per commit from samples
    const avgAdditionsPerCommit = totalSampledCommits > 0 
      ? totalSampledAdditions / totalSampledCommits 
      : 100 // fallback
    const avgDeletionsPerCommit = totalSampledCommits > 0 
      ? totalSampledDeletions / totalSampledCommits 
      : 30 // fallback
    
    console.log(`Sampled ${totalSampledCommits} commits: avg +${avgAdditionsPerCommit.toFixed(0)}/-${avgDeletionsPerCommit.toFixed(0)} per commit`)
    
    // Now build daily stats using commit counts and calculated averages
    const dailyStats = new Map<string, number>()
    
    for (const repo of contributionData) {
      for (const edge of repo.contributions.edges) {
        const date = new Date(edge.node.occurredAt).toISOString().split('T')[0]
        const commitCount = edge.node.commitCount || 1
        dailyStats.set(date, (dailyStats.get(date) || 0) + commitCount)
      }
    }
    
    console.log(`Daily stats: ${dailyStats.size} days with commits`)
    console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`)
    
    // Convert to final format using calculated averages
    const stats: CommitStats[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const commitCount = dailyStats.get(dateStr) || 0
      
      stats.push({
        date: dateStr,
        additions: Math.round(commitCount * avgAdditionsPerCommit),
        deletions: Math.round(commitCount * avgDeletionsPerCommit),
        net: Math.round(commitCount * (avgAdditionsPerCommit - avgDeletionsPerCommit))
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    const responseData = {
      stats,
      summary: {
        totalAdditions: stats.reduce((sum, s) => sum + s.additions, 0),
        totalDeletions: stats.reduce((sum, s) => sum + s.deletions, 0),
        totalNet: stats.reduce((sum, s) => sum + s.net, 0),
        daysWithCommits: stats.filter(s => s.additions > 0 || s.deletions > 0).length,
        repositories: contributionData.length,
        sampledCommits: totalSampledCommits,
        avgLocPerCommit: Math.round(avgAdditionsPerCommit - avgDeletionsPerCommit)
      }
    }
    
    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    })
    
    console.log(`Cached optimized data for ${cacheKey}`)
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub statistics' },
      { status: 500 }
    )
  }
}