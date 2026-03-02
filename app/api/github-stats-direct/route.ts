import { NextResponse } from 'next/server'
import { fetchGitHubStats } from '@/lib/github'

export const runtime = 'edge'
export const revalidate = 3600

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')

  try {
    const data = await fetchGitHubStats(days)
    return NextResponse.json(data)
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub statistics' },
      { status: 500 }
    )
  }
}
