import Link from 'next/link'
import { EDUCATION, LINKS, PROFILE, PUBLICATIONS, ROLES, SKILLS } from '@/lib/cv'

export const metadata = {
  title: 'CV - Cillian Berragan',
  description:
    'CV of Cillian Berragan, Founding AI Engineer at Nebula: experience, education, publications and skills.',
  alternates: { canonical: '/cv' },
}

export default function CvPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-8 sm:p-8">
      <div className="max-w-3xl w-full min-w-0">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl font-mono font-bold text-primary">Cillian Berragan</h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">
              {PROFILE.title} · {PROFILE.location}
            </p>
          </div>
          <div className="flex gap-4 font-mono text-sm text-muted-foreground shrink-0">
            <a href="/cv.pdf" download="cillian-berragan-cv.pdf" className="hover:text-primary transition-colors">
              PDF
            </a>
            <Link href="/" className="hover:text-primary transition-colors">
              ← home
            </Link>
          </div>
        </div>

        <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-8">{PROFILE.summary}</p>

        <section className="mb-8">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Experience
          </h2>
          <ul className="space-y-4">
            {ROLES.map((r) => (
              <li key={r.org + r.period} className="py-4 border-b border-border/40 last:border-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
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
                  <span className="font-mono text-xs text-muted-foreground sm:text-right">
                    {r.period}
                    {r.location && (
                      <>
                        <span className="sm:hidden"> · </span>
                        <br className="hidden sm:inline" />
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
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
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
            Publications
          </h2>
          <ul className="space-y-3">
            {PUBLICATIONS.map((p) => (
              <li key={p.title} className="py-4 border-b border-border/40 last:border-0">
                <h3 className="font-mono text-sm">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {p.title}
                  </a>
                </h3>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  <span className="text-secondary">{p.venue}</span> · {p.year}
                </p>
              </li>
            ))}
          </ul>
          <p className="font-mono text-xs text-muted-foreground mt-2 text-center">
            All papers and citations on{' '}
            <a
              href={LINKS.scholar}
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
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={LINKS.scholar}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Scholar
            </a>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a href={`mailto:${PROFILE.email}`} className="hover:text-primary transition-colors">
              Email
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
