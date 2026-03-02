'use client'

import GitHubCalendar from 'react-github-calendar'
import { Github } from 'lucide-react'
import { LocChart } from '@/components/loc-chart'

export default function Home() {

  const theme = {
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-mono font-bold mb-3 text-primary">Cillian Berragan</h1>
          <p className="text-muted-foreground font-mono">
            Software engineer @{' '}
            <a 
              href="https://thirdweb.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary transition-colors"
            >
              thirdweb
            </a>
          </p>
        </div>

        <div className="mb-12">
          <div className="flex justify-center gap-6 mb-10 text-sm font-mono text-muted-foreground">
            <span>AI/ML</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Python</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Arch/Neovim</span>
          </div>

          <div className="mb-8 text-center">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-4">Currently Building</p>
            
            <div className="space-y-6">
              <a 
                href="https://thirdweb.com/ai"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <h2 className="text-xl font-mono font-bold mb-2 group-hover:text-primary transition-colors">
                  thirdweb AI
                </h2>
                <p className="text-sm text-muted-foreground font-mono max-w-md mx-auto">
                  Blockchain AI that can read, write, and transact across 2500+ EVM chains
                </p>
              </a>
              
              <div className="text-center">
                <h2 className="text-xl font-mono font-bold mb-2 text-muted-foreground/50">
                  [Redacted]
                </h2>
                <p className="text-sm text-muted-foreground/50 font-mono max-w-md mx-auto">
                  Next-generation AI agent infrastructure · Announcement pending
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-4 overflow-hidden mb-6">
            <div className="w-full max-w-full">
              <GitHubCalendar 
                username="cjber"
                theme={theme}
                colorScheme="dark"
                fontSize={11}
                blockSize={10}
                blockMargin={2}
                showWeekdayLabels
                hideColorLegend
                hideTotalCount
              />
            </div>
          </div>
          
          <LocChart />
        </div>

        <div className="mb-10">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3 text-center">Featured Project</p>
          <a 
            href="https://github.com/cjber/dotfiles"
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-10 group"
          >
            <div className="border border-border/50 rounded-lg p-4 hover:border-border transition-colors">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-base font-mono group-hover:text-primary transition-colors">dotfiles</h3>
                <Github className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                Arch Linux w/ Hyprland · Lua/Shell
              </p>
            </div>
          </a>

          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3 text-center">Publications</p>
          <div className="space-y-3 max-w-2xl mx-auto">
            <a 
              href="https://scholar.google.com/citations?user=mBNb4rgAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="font-mono text-sm hover:text-primary transition-colors">
                <span className="text-muted-foreground">2024</span>
                <span className="mx-2">·</span>
                <span>Mapping Great Britain&apos;s semantic footprints through LLM analysis of Reddit</span>
              </div>
            </a>
            <a 
              href="https://scholar.google.com/citations?user=mBNb4rgAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="font-mono text-sm hover:text-primary transition-colors">
                <span className="text-muted-foreground">2023</span>
                <span className="mx-2">·</span>
                <span>Transformer based NER for place name extraction from unstructured text</span>
              </div>
            </a>
            <a 
              href="https://scholar.google.com/citations?user=mBNb4rgAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="font-mono text-sm hover:text-primary transition-colors">
                <span className="text-muted-foreground">2023</span>
                <span className="mx-2">·</span>
                <span>Overture POI data for the United Kingdom</span>
              </div>
            </a>
          </div>
          <div className="text-center mt-4">
            <a 
              href="https://scholar.google.com/citations?user=mBNb4rgAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground font-mono hover:text-primary transition-colors"
            >
              View all on Google Scholar →
            </a>
          </div>
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