import Link from 'next/link'

export const metadata = {
  title: 'CV — Cillian Berragan',
}

// Placeholder. Real content gets dropped in from a LinkedIn export
// once that lands. Structure is locked so the swap is just text.

type Role = {
  org: string
  url?: string
  title: string
  period: string
  bullets: string[]
}

const ROLES: Role[] = [
  {
    org: 'Nebula',
    url: 'https://nebula.gg',
    title: 'Founding Engineer',
    period: 'Present',
    bullets: [
      'Building the AI engineering platform end to end.',
      'Agent runtime, evaluation pipeline, product surfaces.',
    ],
  },
  {
    org: 'thirdweb',
    url: 'https://thirdweb.com',
    title: 'Engineer (AI)',
    period: 'Previously',
    bullets: [
      'Designed and built thirdweb AI: onchain agents with tool use and chain-aware inference.',
    ],
  },
]

type Education = {
  org: string
  qualification: string
  period: string
  note?: string
}

const EDUCATION: Education[] = [
  {
    org: 'University of Liverpool',
    qualification: 'PhD, Geographic Data Science',
    period: 'Awarded',
    note:
      'Regional identity and cohesion in Britain via Reddit comments; geospatial NLP.',
  },
]

export default function CvPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="text-2xl font-mono font-bold text-primary">CV</h1>
          <Link
            href="/"
            className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← home
          </Link>
        </div>

        <section className="mb-8">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Experience
          </h2>
          <ul className="space-y-5">
            {ROLES.map((r) => (
              <li key={r.org} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-mono text-base">
                    <span className="text-foreground">{r.title}</span>{' '}
                    <span className="text-muted-foreground">·</span>{' '}
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {r.org}
                      </a>
                    ) : (
                      <span className="text-primary">{r.org}</span>
                    )}
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {r.period}
                  </span>
                </div>
                <ul className="font-mono text-sm text-muted-foreground space-y-1 mt-2 ml-4 list-disc">
                  {r.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Education
          </h2>
          <ul className="space-y-3">
            {EDUCATION.map((e) => (
              <li key={e.org} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-mono text-base">
                    <span className="text-foreground">{e.qualification}</span>{' '}
                    <span className="text-muted-foreground">·</span>{' '}
                    <span className="text-secondary">{e.org}</span>
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {e.period}
                  </span>
                </div>
                {e.note && (
                  <p className="font-mono text-sm text-muted-foreground mt-1">{e.note}</p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <footer className="text-center text-sm text-muted-foreground font-mono">
          <div className="flex justify-center gap-6">
            <a
              href="https://linkedin.com/in/cjberr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://scholar.google.com/citations?user=mBNb4rgAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Scholar
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
