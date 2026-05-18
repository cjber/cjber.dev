import type React from 'react'
import Link from 'next/link'
import {
  NebulaIcon,
  ThirdwebIcon,
  HyprviewIcon,
  OxideIcon,
  DotfilesIcon,
  ResearchIcon,
} from '@/components/project-icons'

export const metadata = {
  title: 'Projects — Cillian Berragan',
}

type LinkRef = { label: string; href: string }

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
      'Autonomous AI workforce platform. Founding engineer; agent execution, durable workflows, 600+ app integrations.',
    meta: 'Current',
    primary: { label: 'nebula.gg', href: 'https://nebula.gg' },
    Icon: NebulaIcon,
  },
  {
    name: 'thirdweb AI',
    description:
      'Conversational onchain agent platform. RAG pipelines, API surfaces, agent tooling as primary backend engineer.',
    meta: '2025 – 2026',
    primary: { label: 'thirdweb.com/ai', href: 'https://thirdweb.com/ai' },
    Icon: ThirdwebIcon,
  },
  {
    name: 'hyprview',
    description:
      'Workspace overview for Hyprland 0.55+. Pure Lua module; no plugin or build step.',
    meta: 'OSS',
    primary: { label: 'github.com/cjber/hyprview', href: 'https://github.com/cjber/hyprview' },
    Icon: HyprviewIcon,
  },
  {
    name: 'oxide',
    description:
      'Dark colour scheme with rust-orange, teal, and peach accents. Palette plus thirteen application ports.',
    meta: 'OSS',
    primary: { label: 'github.com/cjber/oxide', href: 'https://github.com/cjber/oxide' },
    Icon: OxideIcon,
  },
  {
    name: 'dotfiles',
    description:
      'Arch Linux setup managed with dotter. Hyprland, Neovim, Zellij, Kitty, Waybar.',
    primary: { label: 'github.com/cjber/dotfiles', href: 'https://github.com/cjber/dotfiles' },
    Icon: DotfilesIcon,
  },
  {
    name: 'PhD research',
    description:
      'Extracting and mapping cognitive place from social media text. Geographic NLP at the University of Liverpool, 2019 – 2023.',
    meta: 'PhD',
    links: [
      { label: 'Scholar', href: 'https://scholar.google.com/citations?user=mBNb4rgAAAAJ&hl=en' },
      { label: 'TIBG 2024', href: 'https://rgs-ibg.onlinelibrary.wiley.com/journal/14755661' },
      { label: 'reddit-footprint', href: 'https://github.com/cjber/reddit-footprint' },
      { label: 'thesis', href: 'https://github.com/cjber/thesis' },
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
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {entry.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
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

        <footer className="text-center text-sm text-muted-foreground font-mono">
          <div className="flex justify-center gap-6">
            <a href="https://github.com/cjber" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
            <a href="mailto:cillian@berragan.co.uk" className="hover:text-primary transition-colors">Email</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
