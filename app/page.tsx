import { GitHubCalendarWrapper } from '@/components/github-calendar'
import { LocChart } from '@/components/loc-chart'
import { fetchGitHubStats } from '@/lib/github'

export const revalidate = 3600

export default async function Home() {
  let initialData = null
  try {
    initialData = await fetchGitHubStats(90)
  } catch {
    // Will show error state in chart
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-mono font-bold mb-3 text-primary">Cillian Berragan</h1>
          <p className="text-muted-foreground font-mono">
            Founding Engineer @{' '}
            <a
              href="https://nebula.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary transition-colors"
            >
              Nebula
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
          <p className="text-muted-foreground/80 font-mono text-sm mt-4 max-w-md mx-auto">
            PhD in NLP and geospatial data science from the University of Liverpool.
            Built{' '}
            <a
              href="https://thirdweb.com/ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              thirdweb AI
            </a>
            , now building nebula.gg.
          </p>
        </div>

        <div className="mb-12">

          <div className="bg-card rounded-lg border border-border p-4 overflow-hidden mb-6">
            <div className="w-full max-w-full">
              <GitHubCalendarWrapper />
            </div>
          </div>

          <LocChart initialData={initialData} />
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
            <a
              href="https://x.com/cjberragan"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://scholar.google.com/citations?user=mBNb4rgAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Scholar
            </a>
            <a
              href="https://linkedin.com/in/cjberr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:cjberragan@gmail.com"
              className="hover:text-primary transition-colors"
            >
              Email
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
