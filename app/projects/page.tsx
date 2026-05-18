import Link from 'next/link'
import { ProjectCard, type Project } from '@/components/project-card'

export const metadata = {
  title: 'Projects — Cillian Berragan',
}

const PROJECTS: Project[] = [
  {
    name: 'Nebula',
    href: 'https://nebula.gg',
    description:
      'AI engineering platform. Founding engineer; building the agent runtime, eval pipeline, and product surfaces.',
    tags: ['Work'],
    monogram: 'N',
    accent: 'primary',
  },
  {
    name: 'thirdweb AI',
    href: 'https://thirdweb.com/ai',
    description:
      'Onchain AI agents for thirdweb. Designed and built the inference, tool-use, and chain-aware agent stack.',
    tags: ['Prev work'],
    monogram: 'T',
    accent: 'secondary',
  },
  {
    name: 'hyprview',
    href: 'https://github.com/cjber/hyprview',
    description:
      'Workspace overview for Hyprland 0.55+. Pure Lua module, no C++ plugin or hyprpm required.',
    tags: ['OSS'],
    monogram: 'H',
    accent: 'primary',
  },
  {
    name: 'oxide',
    href: 'https://github.com/cjber/oxide',
    description:
      'Dark colour scheme with rust-orange, teal, and peach accents. Palette plus thirteen application ports.',
    tags: ['OSS'],
    monogram: 'O',
    accent: 'accent',
  },
  {
    name: 'dotfiles',
    href: 'https://github.com/cjber/dotfiles',
    description:
      'Arch Linux setup. Hyprland, Neovim, Zellij, Kitty, Waybar; managed with dotter.',
    tags: ['Config'],
    monogram: 'D',
    accent: 'secondary',
  },
  {
    name: 'reddit-footprint',
    href: 'https://github.com/cjber/reddit-footprint',
    description:
      'Regional identity and cohesion in Britain measured through Reddit comments. From the PhD.',
    tags: ['Research'],
    monogram: 'R',
    accent: 'accent',
  },
]

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="text-2xl font-mono font-bold text-primary">Projects</h1>
          <Link
            href="/"
            className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← home
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>

        <footer className="text-center text-sm text-muted-foreground font-mono">
          <div className="flex justify-center gap-6">
            <a
              href="https://github.com/cjber"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a href="mailto:cillian@berragan.co.uk" className="hover:text-primary transition-colors">
              Email
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
