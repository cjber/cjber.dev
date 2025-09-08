'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, boolean>>({})
  const [statusLoading, setStatusLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Fetch service statuses
    const fetchStatuses = async () => {
      try {
        const response = await fetch('https://status-checker.cjberragan.workers.dev')
        const data = await response.json()
        setStatuses(data)
      } catch (error) {
        console.error('Failed to fetch statuses:', error)
      } finally {
        setStatusLoading(false)
      }
    }
    
    fetchStatuses()
    // Refresh every 60 seconds
    const interval = setInterval(fetchStatuses, 60000)
    return () => clearInterval(interval)
  }, [])

  const links = [
    { name: 'Home', href: 'https://ha.cjber.dev', description: 'Smart home control', statusKey: 'home' },
    { name: 'Storage', href: 'https://nas.cjber.dev', description: 'File management', statusKey: 'storage' },
    { name: 'Plex', href: 'https://plex.cjber.dev', description: 'Media streaming', statusKey: 'plex' },
    { name: 'Request', href: 'https://req.cjber.dev', description: 'Media requests', statusKey: 'request' },
  ]

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-mono font-bold mb-4 text-primary">
            cjber<Link href="/bins" className="hover:text-secondary transition-colors">.</Link>dev
          </h1>
          <p className="text-muted-foreground font-mono">
            <a href="/me" className="text-secondary hover:text-primary transition-colors">
              Software engineer
            </a>
            {' '}@ <a href="https://thirdweb.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary transition-colors">thirdweb</a>
          </p>
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
                {/* Status indicator */}
                {link.statusKey && (
                  <div className="absolute -top-3 -right-3">
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        statusLoading ? 'bg-muted animate-pulse' :
                        statuses[link.statusKey] ? 'bg-emerald-600 animate-pulse' : 'bg-destructive animate-pulse'
                      }`}
                    />
                  </div>
                )}
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