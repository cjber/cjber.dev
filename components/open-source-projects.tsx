import snapshot from '@/lib/open-source.json'

type Repository = (typeof snapshot.repositories)[number]

function RepositoryRow({ repository }: { repository: Repository }) {
  const name = repository.name.split('/')[1]
  return (
    <li className="py-4 flex items-start gap-4">
      {name === 'kiln' && (
        // eslint-disable-next-line @next/next/no-img-element -- Shared SVG mark from kiln.
        <img src="/kiln.svg" alt="" width="48" height="48" className="rounded-xl shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <a href={repository.url} target="_blank" rel="noopener noreferrer" className="font-mono text-base hover:text-primary transition-colors">
            {name}
          </a>
          {repository.fork && <span className="font-mono text-xs text-muted-foreground">Fork</span>}
        </div>
        {repository.description && <p className="font-mono text-sm text-muted-foreground mt-1 leading-relaxed break-words">{repository.description}</p>}
      </div>
    </li>
  )
}

export function OpenSourceProjects() {
  const active = snapshot.repositories.filter(repository => !repository.archived)
    .sort((a, b) => Number(b.name.endsWith('/kiln')) - Number(a.name.endsWith('/kiln')) || a.name.localeCompare(b.name))
  const archived = snapshot.repositories.filter(repository => repository.archived)
  return (
    <section className="mb-12">
      <h2 className="font-mono text-lg mb-2">Open source</h2>
      <p className="font-mono text-sm text-muted-foreground mb-4">Public projects and merged contributions to other repositories.</p>
      <ul className="divide-y divide-border/40">{active.map(repository => <RepositoryRow key={repository.name} repository={repository} />)}</ul>
      <details className="mt-6">
        <summary className="font-mono text-sm cursor-pointer hover:text-primary">Archived projects ({archived.length})</summary>
        <ul className="divide-y divide-border/40 mt-3">{archived.map(repository => <RepositoryRow key={repository.name} repository={repository} />)}</ul>
      </details>
      <h3 className="font-mono text-lg mt-10 mb-3">Upstream contributions</h3>
      <div className="divide-y divide-border/40">
        {snapshot.contributions.map(repository => (
          <details key={repository.name} className="py-4">
            <summary className="font-mono text-sm cursor-pointer hover:text-primary break-words">
              {repository.name} <span className="text-muted-foreground">({repository.pullRequests.length} merged {repository.pullRequests.length === 1 ? 'PR' : 'PRs'})</span>
            </summary>
            <ul className="mt-3 space-y-3 pl-5">
              {repository.pullRequests.map(pr => <li key={pr.url} className="font-mono text-sm text-muted-foreground break-words"><a href={pr.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{pr.title}</a></li>)}
            </ul>
          </details>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground mt-6">Updated {snapshot.generatedAt.slice(0, 10)}. <a href={`https://github.com/${snapshot.username}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">GitHub profile</a></p>
    </section>
  )
}
