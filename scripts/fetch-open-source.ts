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
type PullRequest = { title: string; html_url: string; repository_url: string }

async function main() {
  const repositories: Repository[] = []
  for (let page = 1; ; page++) {
    const batch = await get<Repository[]>(`/users/${encodeURIComponent(username)}/repos?type=owner&sort=full_name&per_page=100&page=${page}`)
    repositories.push(...batch.filter(repo => !repo.private))
    if (batch.length < 100) break
  }

  const contributions = new Map<string, PullRequest[]>()
  const query = encodeURIComponent(`author:${username} is:pr is:merged is:public -user:${username}`)
  for (let page = 1; ; page++) {
    const batch = await get<{ total_count: number; incomplete_results: boolean; items: PullRequest[] }>(`/search/issues?q=${query}&sort=created&order=desc&per_page=100&page=${page}`)
    if (batch.incomplete_results || batch.total_count > 1000) throw new Error('GitHub search is incomplete; keep the existing snapshot.')
    for (const pr of batch.items) {
      const repository = pr.repository_url.replace('https://api.github.com/repos/', '')
      const items = contributions.get(repository) ?? []
      items.push(pr)
      contributions.set(repository, items)
    }
    if (page * 100 >= batch.total_count) break
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
    contributions: [...contributions].sort(([a], [b]) => a.localeCompare(b)).map(([name, prs]) => ({
      name,
      url: `https://github.com/${name}`,
      pullRequests: prs.map(pr => ({ title: pr.title, url: pr.html_url })),
    })),
  }
  writeFileSync(resolve('lib/open-source.json'), JSON.stringify(snapshot, null, 2) + '\n')
  console.log(`Saved ${repositories.length} public repositories and contributions to ${contributions.size} upstream projects.`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
