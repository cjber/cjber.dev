import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { config } from 'dotenv'

config({ path: '.env.local' })
config()

const username = process.env.GITHUB_USERNAME ?? 'cjber'
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, { headers })
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${path}`)
  return response.json() as Promise<T>
}

type Repository = {
  full_name: string
  html_url: string
  description: string | null
  archived: boolean
  fork: boolean
  private: boolean
}

async function main() {
  const repositories: Repository[] = []
  for (let page = 1; ; page++) {
    const batch = await get<Repository[]>(`/users/${encodeURIComponent(username)}/repos?type=owner&sort=full_name&per_page=100&page=${page}`)
    repositories.push(...batch.filter(repo => !repo.private))
    if (batch.length < 100) break
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    username,
    repositories: repositories.map(repo => ({
      name: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      archived: repo.archived,
      fork: repo.fork,
    })),
  }
  writeFileSync(resolve('lib/open-source.json'), JSON.stringify(snapshot, null, 2) + '\n')
  console.log(`Saved ${repositories.length} public repositories.`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
