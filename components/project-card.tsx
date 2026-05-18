import Link from 'next/link'

export type Project = {
  name: string
  href: string
  description: string
  tags: string[]
  // One-letter monogram for the icon tile; uses oxide accent tones for fill.
  monogram: string
  accent?: 'primary' | 'secondary' | 'accent'
}

const ACCENT_BG: Record<NonNullable<Project['accent']>, string> = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  accent: 'bg-accent text-accent-foreground',
}

export function ProjectCard({ project }: { project: Project }) {
  const accentClass = ACCENT_BG[project.accent ?? 'primary']
  const external = project.href.startsWith('http')
  const Wrapper = external ? 'a' : Link
  const props: Record<string, string> = external
    ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: project.href }

  return (
    // @ts-expect-error: union between <a> and <Link> attributes
    <Wrapper
      {...props}
      className="group block bg-card rounded-lg border border-border p-4 transition-colors hover:border-primary"
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-md ${accentClass} flex items-center justify-center font-mono font-bold text-xl shrink-0`}
          aria-hidden
        >
          {project.monogram}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-mono text-base text-foreground group-hover:text-primary transition-colors truncate">
              {project.name}
            </h3>
            {project.tags.length > 0 && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
                {project.tags[0]}
              </span>
            )}
          </div>
          <p className="font-mono text-sm text-muted-foreground mt-1 leading-snug">
            {project.description}
          </p>
        </div>
      </div>
    </Wrapper>
  )
}
