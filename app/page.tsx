'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const links = [
    { name: 'Me', href: '/me', description: 'About me' },
    { name: 'HA', href: 'https://ha.cjber.dev', description: 'Home Assistant' },
    { name: 'NAS', href: 'https://plex.cjber.dev', description: 'Plex media server' },
    { name: 'Req', href: 'https://req.cjber.dev', description: 'Overseerr requests' },
  ]

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-mono font-bold mb-4 text-primary">cjber.dev</h1>
          <p className="text-muted-foreground font-mono">Software engineer @ <a href="https://thirdweb.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary transition-colors">thirdweb</a></p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
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
          ))}
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