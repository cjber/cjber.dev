// Fails with a list of fixes when the hand-written parts of the site drift
// from GitHub: the project groups in lib/projects.ts against the public-repo
// snapshot, and every external link in the source against the live web.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import snapshot from '../lib/open-source.json'
import { EXCLUDED, GROUPS } from '../lib/projects'

const problems: string[] = []

const repositories = new Map(snapshot.repositories.map((repo) => [repo.name.split('/')[1], repo]))
const grouped = new Set(GROUPS.flatMap((group) => group.projects))
for (const name of grouped) {
  if (!repositories.has(name)) problems.push(`lib/projects.ts lists ${name}, which is not a public repository`)
}
for (const [name, repo] of repositories) {
  if (!repo.archived && !grouped.has(name) && !EXCLUDED.includes(name)) {
    problems.push(`${name} is public and active but in no group in lib/projects.ts`)
  }
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(entry.name) ? [path] : []
  })
}

// Template literals and the GitHub API are not pages anyone visits.
const links = new Set(
  ['app', 'components', 'lib']
    .flatMap(sourceFiles)
    .flatMap((file) => readFileSync(file, 'utf8').match(/https:\/\/[^\s'"`<>)]+/g) ?? [])
    .filter((url) => !url.includes('${') && !url.startsWith('https://api.github.com')),
)

// Publishers behind doi.org answer bots with 403, so ask the DOI registry
// whether the DOI resolves instead of fetching the article.
const probe = (url: string) => url.replace('https://doi.org/', 'https://doi.org/api/handles/')

async function checkLink(url: string) {
  try {
    const response = await fetch(probe(url), { redirect: 'follow', signal: AbortSignal.timeout(20_000) })
    // 429 means the site rate-limits bots, not that the page is gone.
    if (response.status >= 400 && response.status !== 429) problems.push(`${url} returns ${response.status}`)
  } catch (error) {
    problems.push(`${url} failed: ${String(error)}`)
  }
}

Promise.all([...links].map(checkLink)).then(() => {
  if (problems.length) {
    console.log(problems.map((problem) => `- ${problem}`).join('\n'))
    process.exit(1)
  }
  console.log(`In sync: ${repositories.size} repositories, ${links.size} links checked.`)
})
