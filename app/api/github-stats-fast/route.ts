import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

export const runtime = 'nodejs'

// Cache for 1 hour
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000

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
    console.log('Fetching GitHub stats using GraphQL...')
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Use GraphQL for much faster queries
    const query = `
      query($username: String!, $from: GitTimestamp!, $to: GitTimestamp!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            commitContributionsByRepository {
              repository {
                name
                owner {
                  login
                }
              }
              contributions {
                totalCount
                edges {
                  node {
                    occurredAt
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
    
    // Process the data to get daily counts
    const dailyStats = new Map<string, number>()
    
    const contributionData = graphqlResponse.user?.contributionsCollection?.commitContributionsByRepository || []
    
    // Count commits per day from the contribution data
    for (const repo of contributionData) {
      for (const edge of repo.contributions.edges) {
        const date = new Date(edge.node.occurredAt).toISOString().split('T')[0]
        dailyStats.set(date, (dailyStats.get(date) || 0) + 1)
      }
    }
    
    // For a rough estimate of LOC, we'll multiply commits by an average
    // This is much faster than fetching each commit's details
    const AVG_LOC_PER_COMMIT = 50 // Reasonable average
    
    // Convert to array format
    const stats = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const commitCount = dailyStats.get(dateStr) || 0
      const estimatedLoc = commitCount * AVG_LOC_PER_COMMIT
      
      stats.push({
        date: dateStr,
        additions: estimatedLoc,
        deletions: Math.floor(estimatedLoc * 0.3), // Assume 30% deletions
        net: Math.floor(estimatedLoc * 0.7),
        commits: commitCount
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    const totalCommits = graphqlResponse.user?.contributionsCollection?.totalCommitContributions || 0
    
    const responseData = {
      stats,
      summary: {
        totalAdditions: stats.reduce((sum, s) => sum + s.additions, 0),
        totalDeletions: stats.reduce((sum, s) => sum + s.deletions, 0),
        totalNet: stats.reduce((sum, s) => sum + s.net, 0),
        daysWithCommits: stats.filter(s => s.commits > 0).length,
        totalCommits: totalCommits,
        note: 'LOC values are estimated based on commit count'
      }
    }
    
    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    })
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub statistics' },
      { status: 500 }
    )
  }
}