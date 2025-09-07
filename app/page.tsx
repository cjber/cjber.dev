'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const links = [
    { name: 'Me', href: '/me', description: 'About me' },
    { name: 'MC', href: null, server: 'mc.cjber.dev', description: 'Minecraft server' },
    { name: 'NAS', href: 'https://plex.cjber.dev', description: 'Plex media server' },
    { name: 'Req', href: 'https://req.cjber.dev', description: 'Overseerr requests' },
  ]

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-mono font-bold mb-4 text-primary">cjber.dev</h1>
          <p className="text-muted-foreground font-mono">Personal services & projects</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link) => {
            const handleClick = () => {
              if (link.server) {
                navigator.clipboard.writeText(link.server)
                setCopied(link.server)
                setTimeout(() => setCopied(null), 2000)
              }
            }

            if (link.href) {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
                  target={link.href?.startsWith('http') ? '_blank' : undefined}
                  rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <h2 className="text-xl font-mono font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors">
                      {link.name}
                    </h2>
                    <p className="text-sm text-muted-foreground font-mono">
                      {link.description}
                    </p>
                  </div>
                </Link>
              )
            }

            return (
              <div
                key={link.name}
                className="relative"
              >
                <div className={`card-container ${flipped ? 'flipped' : ''}`}>
                  {/* Front of card */}
                  <button
                    onClick={() => setFlipped(true)}
                    className="card-front group overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg text-left w-full block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <h2 className="text-xl font-mono font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors">
                        {link.name}
                      </h2>
                      <p className="text-sm text-muted-foreground font-mono">
                        {link.description}
                      </p>
                    </div>
                  </button>

                  {/* Back of card */}
                  <div
                    className="card-back absolute inset-0 rounded-lg border border-primary/50 bg-card p-6 w-full text-left"
                  >
                    <div className="flex flex-col h-full">
                      <button
                        onClick={() => setFlipped(false)}
                        className="absolute top-3 right-3 w-6 h-6 text-muted-foreground hover:text-primary transition-all rounded-md hover:bg-muted/50 flex items-center justify-center"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                      <div>
                        <h2 className="text-xl font-mono font-semibold mb-2 text-card-foreground">
                          {link.name}
                        </h2>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(link.server!)
                            setCopied(link.server)
                            setTimeout(() => {
                              setCopied(null)
                            }, 1000)
                          }}
                          className="inline-block"
                        >
                          <code className="text-sm bg-primary/10 px-3 py-1 rounded font-mono text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                            {copied === link.server ? 'copied!' : link.server}
                          </code>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground font-mono">
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
    </main>
  )
}