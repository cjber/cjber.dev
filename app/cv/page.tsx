import Link from 'next/link'

export const metadata = {
  title: 'CV — Cillian Berragan',
}

// Source of truth for the CV; LinkedIn mirrors this, not the other way around.
// To update: edit the data structures below, push, and CF Pages redeploys.

type Role = {
  org: string
  url?: string
  title: string
  period: string
  location?: string
  bullets: string[]
}

const ROLES: Role[] = [
  {
    org: 'Nebula AI',
    url: 'https://nebula.gg',
    title: 'Founding Engineer',
    period: 'Feb 2026 — Present',
    location: 'Remote',
    bullets: [
      'Autonomous AI workforce platform: users deploy agents that take action across 600+ connected apps from conversation, no code.',
      'Took ownership of the full backend early on; primary engineer driving the platform since.',
      'Agent execution engine, durable workflow orchestration, multi-agent coordination, persistent memory, real-time streaming.',
      '600+ app integrations and the API surfaces powering the product.',
    ],
  },
  {
    org: 'thirdweb',
    url: 'https://thirdweb.com',
    title: 'Software Engineer',
    period: 'Mar 2025 — Mar 2026',
    location: 'Remote',
    bullets: [
      'Engineer on thirdweb AI: a conversational agent platform for interacting with onchain infrastructure and thirdweb dev tools.',
      'Grew into the primary backend engineer, contributing across RAG pipelines, API development, and agent tooling.',
    ],
  },
  {
    org: 'Consumer Data Research Centre',
    title: 'Machine Learning Engineer',
    period: 'Dec 2023 — Mar 2025',
    location: 'Liverpool / Remote',
    bullets: [
      'Built a Retrieval-Augmented Generation search system over a collective UK Data Catalogue, powered by LlamaIndex.',
      'Applied NLP to improve data discovery and access across the catalogue.',
      'Stack: LangChain, ETL pipelines, vector search.',
    ],
  },
  {
    org: 'Geographic Data Science Lab',
    title: 'PhD Researcher',
    period: 'Sep 2019 — Dec 2023',
    location: 'Liverpool',
    bullets: [
      'NLP and geography research at the University of Liverpool.',
      'Extracting and mapping cognitive place associations from Reddit and Twitter text.',
    ],
  },
  {
    org: 'Consumer Data Research Centre (Leeds)',
    title: 'Data Scientist',
    period: 'Feb 2021 — May 2022',
    location: 'Liverpool, part-time',
    bullets: [
      'Access to Healthy Assets & Hazards (AHAH): postcode-to-PoI drive-time index across England.',
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
    qualification: 'PhD, Natural Language Processing & Geography',
    period: '2019 — 2023',
    note: 'Thesis on extracting cognitive place from informal social media text.',
  },
  {
    org: 'University of Liverpool',
    qualification: "MSc, Geographic Data Science",
    period: '2018 — 2019',
    note: 'Distinction (82%). Dissertation 85%: parametric classification of UK rural roads from LiDAR.',
  },
]

type Publication = {
  title: string
  venue: string
  date: string
}

const PUBLICATIONS: Publication[] = [
  {
    title:
      "Mapping Great Britain's semantic footprints through a large language model analysis of Reddit comments",
    venue: 'Computers, Environment and Urban Systems',
    date: 'Jun 2024',
  },
  {
    title:
      'Mapping cognitive place associations within the United Kingdom through online discussion on Reddit',
    venue: 'Transactions of the Institute of British Geographers',
    date: 'Jan 2024',
  },
]

const SKILLS = [
  'Python',
  'Natural Language Processing',
  'LLMs / RAG',
  'Agent systems',
  'LangChain / LlamaIndex',
  'ETL pipelines',
  'Geospatial data',
  'PostgreSQL',
  'TypeScript',
  'Dagster',
  'AWS',
]

export default function CvPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="mb-8 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold text-primary">Cillian Berragan</h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">
              Founding AI Engineer · Glasgow, Scotland
            </p>
          </div>
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
          <ul className="space-y-4">
            {ROLES.map((r) => (
              <li key={r.org + r.period} className="py-4 border-b border-border/40 last:border-0">
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
                  <span className="font-mono text-xs text-muted-foreground shrink-0 text-right">
                    {r.period}
                    {r.location && (
                      <>
                        <br />
                        <span className="text-muted-foreground/70">{r.location}</span>
                      </>
                    )}
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
              <li key={e.qualification} className="py-4 border-b border-border/40 last:border-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-mono text-base">
                    <span className="text-foreground">{e.qualification}</span>{' '}
                    <span className="text-muted-foreground">·</span>{' '}
                    <span className="text-secondary">{e.org}</span>
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">{e.period}</span>
                </div>
                {e.note && (
                  <p className="font-mono text-sm text-muted-foreground mt-1">{e.note}</p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Selected publications
          </h2>
          <ul className="space-y-3">
            {PUBLICATIONS.map((p) => (
              <li key={p.title} className="py-4 border-b border-border/40 last:border-0">
                <h3 className="font-mono text-sm text-foreground">{p.title}</h3>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  <span className="text-secondary">{p.venue}</span> · {p.date}
                </p>
              </li>
            ))}
          </ul>
          <p className="font-mono text-xs text-muted-foreground mt-2 text-center">
            Full list on{' '}
            <a
              href="https://scholar.google.com/citations?user=mBNb4rgAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Scholar
            </a>
            .
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <span
                key={s}
                className="font-mono text-xs px-2 py-1 rounded-sm border border-border/40 text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
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
