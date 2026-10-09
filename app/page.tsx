import { GitHubCalendar } from '@/components/github-calendar'
import { LocChart } from '@/components/loc-chart'
import { LINKS, PROFILE } from '@/lib/cv'
import { githubSnapshot } from '@/lib/github-data'

export const dynamic = 'force-static'

export default function Home() {
  const [summaryStart, summaryEnd] = PROFILE.summary.split('fastbrowse')
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-8 sm:p-8">
      <div className="max-w-3xl w-full min-w-0">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-mono font-bold mb-3 text-primary">Cillian Berragan</h1>
          <p className="text-muted-foreground font-mono">
            {PROFILE.title} @{' '}
            <a
              href={PROFILE.employer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary transition-colors"
            >
              {PROFILE.employer.name}
            </a>
          </p>
          <p className="text-muted-foreground/60 font-mono text-sm mt-1">
            Previously{' '}
            <a
              href="https://thirdweb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              thirdweb
            </a>
          </p>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed mt-5 max-w-xl mx-auto">
            {summaryStart}
            <a
              href="https://github.com/agent-labs-dev/fastbrowse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              fastbrowse
            </a>
            {summaryEnd}
          </p>
        </div>

        <div className="mb-12 space-y-8">
          <section>
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Contributions
            </h2>
            <GitHubCalendar
              weeks={githubSnapshot.calendar.weeks}
              totalContributions={githubSnapshot.calendar.totalContributions}
            />
          </section>

          <LocChart
            generatedAt={githubSnapshot.generatedAt}
            weeks={githubSnapshot.weeks}
            repoNames={githubSnapshot.repoNames}
            totalAdditions={githubSnapshot.totalAdditions}
            totalDeletions={githubSnapshot.totalDeletions}
            totalNet={githubSnapshot.totalNet}
          />
        </div>

        <nav className="text-center text-sm text-muted-foreground font-mono mb-6">
          <div className="flex justify-center gap-6">
            <a href="/projects" className="hover:text-primary transition-colors">Projects</a>
            <a href="/cv" className="hover:text-primary transition-colors">CV</a>
          </div>
        </nav>

        <footer className="text-center text-sm text-muted-foreground font-mono">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
            <a href={LINKS.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter</a>
            <a href={LINKS.scholar} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Scholar</a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href={`mailto:${PROFILE.email}`} className="hover:text-primary transition-colors">Email</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
