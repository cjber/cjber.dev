import type React from 'react'
import Link from 'next/link'
import { OpenSourceProjects } from '@/components/open-source-projects'
import { LINKS, PUBLICATIONS } from '@/lib/cv'
import {
  FastbrowseIcon,
  NebulaIcon,
  ThirdwebIcon,
  ResearchIcon,
} from '@/components/project-icons'

export const metadata = {
  title: 'Projects - Cillian Berragan',
  description:
    'What Cillian Berragan has built: Nebula, fastbrowse, thirdweb AI, published research and open-source tools.',
  alternates: { canonical: '/projects' },
}

type LinkRef = { label: string; href: string; note?: string }

type Entry = {
  name: string
  description: string
  meta?: string
  primary?: LinkRef
  links?: LinkRef[]
  Icon: (p: { className?: string }) => React.ReactElement
}

const ENTRIES: Entry[] = [
  {
    name: 'Nebula',
    description:
      'A multiplayer workspace where teams work alongside AI agents that have real tools, memory and their own computers. I own the backend: agent execution, durable workflows and integrations with hundreds of apps.',
    meta: 'Current',
    primary: { label: 'nebula.gg', href: 'https://nebula.gg' },
    Icon: NebulaIcon,
  },
  {
    name: 'fastbrowse',
    description:
      'An open-source browser agent. A choice model picks each action from the controls on the page, so it cannot click something that is not there, and every claim in an answer cites a quote from the page.',
    meta: 'Open source',
    primary: { label: 'GitHub', href: 'https://github.com/agent-labs-dev/fastbrowse' },
    links: [
      { label: 'fastbrowse.ai', href: 'https://www.fastbrowse.ai' },
      { label: 'PyPI', href: 'https://pypi.org/project/fastbrowse/' },
    ],
    Icon: FastbrowseIcon,
  },
  {
    name: 'thirdweb AI',
    description:
      'A conversational agent platform for onchain infrastructure. I was its primary backend engineer, across RAG pipelines, APIs and agent tooling.',
    meta: '2025 - 2026',
    primary: { label: 'thirdweb.com/ai', href: 'https://thirdweb.com/ai' },
    Icon: ThirdwebIcon,
  },
  {
    name: 'Published research',
    description:
      'Geographic NLP at the University of Liverpool: extracting and mapping how people talk about places from social media text.',
    meta: '2019 - 2023',
    links: [
      ...PUBLICATIONS.map((p) => ({ label: p.title, note: `${p.venue}, ${p.year}`, href: p.url })),
      { label: 'All papers on Google Scholar', href: LINKS.scholar },
    ],
    Icon: ResearchIcon,
  },
]

function EntryRow({ entry }: { entry: Entry }) {
  const Icon = entry.Icon
  const titleHref = entry.primary?.href
  const TitleEl: (props: React.HTMLAttributes<HTMLElement> & { href?: string }) => React.ReactElement =
    titleHref
      ? (p) => (
          <a {...p} href={titleHref} target="_blank" rel="noopener noreferrer">
            {p.children}
          </a>
        )
      : (p) => <span {...p}>{p.children}</span>

  return (
    <div className="group py-5 first:pt-2">
      <div className="flex items-start gap-4">
        <Icon className="w-5 h-5 mt-1 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-mono text-base">
              <TitleEl className="text-foreground group-hover:text-primary transition-colors">
                {entry.name}
              </TitleEl>
            </h3>
            {entry.meta && (
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground shrink-0">
                {entry.meta}
              </span>
            )}
          </div>
          <p className="font-mono text-sm text-muted-foreground mt-1 leading-relaxed">
            {entry.description}
          </p>
          {entry.links && (
            <ul className={entry.links.some((l) => l.note) ? 'mt-3 space-y-2' : 'flex flex-wrap gap-x-4 gap-y-1 mt-2'}>
              {entry.links.map((l) => (
                <li key={l.href} className="font-mono text-xs text-muted-foreground">
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`hover:text-primary transition-colors ${l.note ? 'text-foreground/90' : ''}`}
                  >
                    {l.label}
                  </a>
                  {l.note && <span className="block text-muted-foreground/80 mt-0.5">{l.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-8 sm:p-8">
      <div className="max-w-3xl w-full min-w-0">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Projects
          </h1>
          <Link
            href="/"
            className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← home
          </Link>
        </div>

        <div className="divide-y divide-border/40 mb-12">
          {ENTRIES.map((e) => (
            <EntryRow key={e.name} entry={e} />
          ))}
        </div>

        <OpenSourceProjects />

        <footer className="text-center text-sm text-muted-foreground font-mono">
          <div className="flex justify-center gap-6">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
            <a href="mailto:cillian@berragan.co.uk" className="hover:text-primary transition-colors">Email</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
