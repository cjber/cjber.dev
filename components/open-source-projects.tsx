import snapshot from '@/lib/open-source.json'
import icons from '@/lib/project-icons.json'
import { DotfilesIcon } from '@/components/project-icons'

type Repository = (typeof snapshot.repositories)[number]

const excluded = new Set(['.github', 'cjber', 'MagiskOnWSA'])
const groups = [
  { name: 'Developer tools', projects: ['kiln', 'oxide', 'hyprview', 'skills'] },
  { name: 'WoW addons', projects: ['adventure-guide-forever', 'legacy-forever', 'shortest-path-forever', 'skillup-forever', 'tweaks-forever'] },
  { name: 'Personal website and configuration', projects: ['cjber.dev', 'dotfiles'] },
  { name: 'Research and geospatial work', projects: [] as string[] },
]

function RepositoryRow({ repository }: { repository: Repository }) {
  const name = repository.name.split('/')[1]
  const mark = icons[name as keyof typeof icons]
  return (
    <li className="py-4 flex items-start gap-4">
      {mark ? (
        // eslint-disable-next-line @next/next/no-img-element -- Preserve each project's existing mark.
        <img src={mark.icon} alt="" width={mark.wide ? 96 : 40} height="40" loading="lazy" className={`${mark.wide ? "w-24 bg-zinc-100 p-1" : "w-10"} h-10 object-contain shrink-0 rounded-md`} />
      ) : name === 'dotfiles' ? <DotfilesIcon className="w-10 h-10 text-muted-foreground shrink-0" /> : null}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <a href={repository.url} target="_blank" rel="noopener noreferrer" className="font-mono text-base hover:text-primary transition-colors break-words">
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
  const repositories = snapshot.repositories.filter(repository => !excluded.has(repository.name.split('/')[1]))
  const categorized = new Set(groups.flatMap(group => group.projects))
  return (
    <section className="mb-12">
      <h2 className="font-mono text-lg mb-2">Open source</h2>
      <p className="font-mono text-sm text-muted-foreground mb-6">Tools, addons and research projects.</p>
      {groups.map(group => {
        const members = repositories.filter(repository => {
          const name = repository.name.split('/')[1]
          return group.projects.length ? group.projects.includes(name) : !categorized.has(name)
        }).sort((a, b) => Number(b.name.endsWith('/kiln')) - Number(a.name.endsWith('/kiln')) || a.name.localeCompare(b.name))
        const active = members.filter(repository => !repository.archived)
        const archived = members.filter(repository => repository.archived)
        return (
          <div key={group.name} className="mb-8">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">{group.name}</h3>
            <ul className="divide-y divide-border/40">{active.map(repository => <RepositoryRow key={repository.name} repository={repository} />)}</ul>
            {archived.length > 0 && (
              <details className="mt-3">
                <summary className="font-mono text-sm cursor-pointer hover:text-primary">Archived projects ({archived.length})</summary>
                <ul className="divide-y divide-border/40 mt-3">{archived.map(repository => <RepositoryRow key={repository.name} repository={repository} />)}</ul>
              </details>
            )}
          </div>
        )
      })}
      <p className="font-mono text-xs text-muted-foreground mt-6">Updated {snapshot.generatedAt.slice(0, 10)}. <a href={`https://github.com/${snapshot.username}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">GitHub profile</a></p>
    </section>
  )
}
