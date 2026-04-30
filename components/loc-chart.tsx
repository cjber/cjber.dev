'use client'

import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { WeekStats } from '@/lib/github-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Range = 30 | 90 | 180 | 365
type ChartMode = 'net' | 'all' | 'additions' | 'deletions'

const RANGES: { value: Range; label: string }[] = [
  { value: 30, label: '1m' },
  { value: 90, label: '3m' },
  { value: 180, label: '6m' },
  { value: 365, label: '1y' },
]

const MODES: { value: ChartMode; label: string }[] = [
  { value: 'net', label: 'Net' },
  { value: 'all', label: 'All' },
  { value: 'additions', label: 'Additions' },
  { value: 'deletions', label: 'Deletions' },
]

// Theme-coherent palette: same lightness/chroma as theme primary (orange), hue-rotated.
// Uniform perceptual weight = no color screams louder than another.
const REPO_PALETTE = [
  'oklch(0.72 0.13 50)',   // primary orange (theme)
  'oklch(0.66 0.09 196)',  // teal (theme secondary)
  'oklch(0.74 0.10 70)',   // amber
  'oklch(0.70 0.12 25)',   // coral
  'oklch(0.68 0.10 150)',  // sage green
  'oklch(0.66 0.10 240)',  // muted blue
  'oklch(0.68 0.11 330)',  // muted rose
  'oklch(0.72 0.10 100)',  // olive
  'oklch(0.66 0.10 280)',  // muted violet
  'oklch(0.70 0.08 220)',  // slate blue
]

const ADDITION_COLOR = 'oklch(0.68 0.10 150)' // sage green
const DELETION_COLOR = 'oklch(0.62 0.13 25)'  // muted brick

interface Props {
  weeks: WeekStats[]
  repoNames: string[]
}

const formatNumber = (n: number) => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

const formatDate = (d: string) =>
  new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export function LocChart({ weeks, repoNames }: Props) {
  const [days, setDays] = useState<Range>(90)
  const [mode, setMode] = useState<ChartMode>('net')

  const data = useMemo(() => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return weeks.filter((w) => new Date(w.date + 'T00:00:00Z').getTime() >= cutoff)
  }, [weeks, days])

  const summary = useMemo(() => {
    const totalAdditions = data.reduce((s, w) => s + w.additions, 0)
    const totalDeletions = data.reduce((s, w) => s + w.deletions, 0)
    const activeRepoSet = new Set<string>()
    for (const w of data) {
      for (const r of repoNames) if (typeof w[r] === 'number' && w[r] !== 0) activeRepoSet.add(r)
    }
    return {
      totalAdditions,
      totalDeletions,
      totalNet: totalAdditions - totalDeletions,
      activeWeeks: data.filter((w) => w.additions > 0 || w.deletions > 0).length,
      repositories: activeRepoSet.size,
    }
  }, [data, repoNames])

  const activeRepos = useMemo(() => {
    return repoNames.filter((r) => data.some((d) => typeof d[r] === 'number' && d[r] !== 0))
  }, [repoNames, data])

  const isEmpty = data.length === 0

  return (
    <Card className="w-full border-border/60 bg-card shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-sm font-mono font-medium tracking-wide text-foreground/90">
            Lines of code · weekly
          </CardTitle>
          <SegmentedControl
            value={days}
            onChange={(v) => setDays(v as Range)}
            options={RANGES}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        <StatStrip summary={summary} />

        <div className="mt-4 mb-6">
          <SegmentedControl
            value={mode}
            onChange={(v) => setMode(v as ChartMode)}
            options={MODES}
            size="sm"
          />
        </div>

        {isEmpty ? (
          <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground/70 font-mono">
            No activity in this window
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260} className="[&_.recharts-bar-rectangle_path]:[shape-rendering:crispEdges]">
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
              barCategoryGap={3}
            >
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                minTickGap={28}
                interval="preserveStartEnd"
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                tickFormatter={formatNumber}
                width={42}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted-foreground)', opacity: 0.06 }}
                contentStyle={{
                  backgroundColor: 'color-mix(in oklch, var(--card), transparent 10%)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--card-foreground)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  padding: '8px 10px',
                }}
                itemStyle={{ padding: '2px 0' }}
                labelStyle={{ color: 'var(--muted-foreground)', marginBottom: 4, fontSize: 10 }}
                labelFormatter={(value) => `Week of ${formatDate(value as string)}`}
                formatter={(value: number, name) => [formatNumber(value), name]}
              />

              {(mode === 'all' || mode === 'additions') && (
                <Bar
                  dataKey="additions"
                  fill={ADDITION_COLOR}
                  name="Additions"
                  radius={0}
                  isAnimationActive={false}
                />
              )}
              {(mode === 'all' || mode === 'deletions') && (
                <Bar
                  dataKey="deletions"
                  fill={DELETION_COLOR}
                  name="Deletions"
                  radius={0}
                  isAnimationActive={false}
                />
              )}
              {mode === 'net' && activeRepos.length > 0 &&
                activeRepos.map((repo, i) => (
                  <Bar
                    key={repo}
                    dataKey={repo}
                    stackId="net"
                    fill={REPO_PALETTE[i % REPO_PALETTE.length]}
                    name={repo}
                    radius={0}
                    isAnimationActive={false}
                  />
                ))}
              {mode === 'net' && activeRepos.length === 0 && (
                <Bar
                  dataKey="net"
                  fill="var(--primary)"
                  name="Net"
                  radius={0}
                  isAnimationActive={false}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}

        {mode === 'net' && activeRepos.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border/40">
            <Legend repos={activeRepos} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type StatItem = { label: string; value: string; tone?: string; style?: React.CSSProperties }

function StatStrip({
  summary,
}: {
  summary: { totalAdditions: number; totalDeletions: number; totalNet: number; activeWeeks: number; repositories: number }
}) {
  const items: StatItem[] = [
    {
      label: 'Net',
      value: `${summary.totalNet >= 0 ? '+' : ''}${formatNumber(summary.totalNet)}`,
      tone: 'text-primary',
    },
    {
      label: 'Added',
      value: `+${formatNumber(summary.totalAdditions)}`,
      style: { color: 'oklch(0.68 0.10 150)' },
    },
    {
      label: 'Removed',
      value: `−${formatNumber(summary.totalDeletions)}`,
      style: { color: 'oklch(0.62 0.13 25)' },
    },
    {
      label: 'Weeks',
      value: summary.activeWeeks.toString(),
      tone: 'text-foreground/80',
    },
    {
      label: 'Repos',
      value: summary.repositories.toString(),
      tone: 'text-foreground/80',
    },
  ]
  return (
    <div className="flex items-baseline gap-4 flex-wrap">
      {items.map((it, i) => (
        <div key={it.label} className="flex items-baseline gap-2">
          {i > 0 && <span className="text-border/70 font-mono text-xs select-none">·</span>}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-mono">{it.label}</span>
          <span
            className={`font-mono text-sm tabular-nums ${it.tone ?? ''}`}
            style={it.style}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
  size = 'md',
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  size?: 'sm' | 'md'
}) {
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md bg-muted/40 p-0.5 border border-border/40">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`${padding} text-[11px] font-mono rounded transition-colors ${
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Legend({ repos }: { repos: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-mono text-muted-foreground">
      {repos.map((r, i) => (
        <div key={r} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ backgroundColor: REPO_PALETTE[i % REPO_PALETTE.length] }}
          />
          <span>{r}</span>
        </div>
      ))}
    </div>
  )
}
