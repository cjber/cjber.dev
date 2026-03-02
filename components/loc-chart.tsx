'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartData {
  date: string
  additions: number
  deletions: number
  net: number
  [repo: string]: string | number
}

interface Summary {
  totalAdditions: number
  totalDeletions: number
  totalNet: number
  activeWeeks: number
  repositories: number
}

interface StatsResponse {
  stats: ChartData[]
  repos?: string[]
  summary: Summary
}

interface LocChartProps {
  initialData: StatsResponse | null
}

const REPO_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

export function LocChart({ initialData }: LocChartProps) {
  const [data, setData] = useState<ChartData[]>(initialData?.stats ?? [])
  const [repos, setRepos] = useState<string[]>(initialData?.repos ?? [])
  const [summary, setSummary] = useState<Summary | null>(initialData?.summary ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialData ? null : 'Failed to load stats')
  const [days, setDays] = useState(90)
  const [chartType, setChartType] = useState<'all' | 'additions' | 'deletions' | 'net'>('net')
  const [hasNavigated, setHasNavigated] = useState(false)

  useEffect(() => {
    if (days === 90 && initialData && !hasNavigated) return
    setHasNavigated(true)

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/github-stats-direct?days=${days}&username=cjber`)

        if (!response.ok) {
          let message = 'Failed to fetch data'
          try {
            const errorData = await response.json()
            message = errorData.error || message
          } catch {
            // Response wasn't JSON
          }
          throw new Error(message)
        }

        const result = await response.json()
        setData(result.stats)
        setRepos(result.repos ?? [])
        setSummary(result.summary)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days, initialData])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  // Only show repos that have data in the current view
  const activeRepos = useMemo(() => {
    return repos.filter(repo => data.some(d => (d[repo] as number) !== undefined && (d[repo] as number) !== 0))
  }, [repos, data])

  if (error && !loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-mono">Lines of Code per Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive font-mono">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">Lines of Code per Week</CardTitle>
          <div className="flex gap-2">
            {[
              { value: 30, label: '1m' },
              { value: 90, label: '3m' },
              { value: 180, label: '6m' },
              { value: 365, label: '1y' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  days === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {summary && (
          <div className="flex gap-4 mb-6 text-xs font-mono">
            <div>
              <span className="text-muted-foreground">Additions: </span>
              <span className="text-green-500">+{formatNumber(summary.totalAdditions)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Deletions: </span>
              <span className="text-red-500">-{formatNumber(summary.totalDeletions)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Net: </span>
              <span className={summary.totalNet >= 0 ? 'text-green-500' : 'text-red-500'}>
                {summary.totalNet >= 0 ? '+' : ''}{formatNumber(summary.totalNet)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Active weeks: </span>
              <span>{summary.activeWeeks}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Repos: </span>
              <span>{summary.repositories}</span>
            </div>
          </div>
        )}

        <div className="mb-4 flex gap-2">
          {(['net', 'all', 'additions', 'deletions'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors capitalize ${
                chartType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground font-mono">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)' }}
                fontSize={11}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)' }}
                fontSize={11}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--card-foreground)',
                }}
                cursor={{ fill: 'var(--muted-foreground)', opacity: 0.05 }}
                labelFormatter={(value) => `Week of ${formatDate(value as string)}`}
                formatter={(value: number) => formatNumber(value)}
              />
              {(chartType === 'all' || chartType === 'additions') && (
                <Bar dataKey="additions" fill="#10b981" opacity={0.7} name="Additions" />
              )}
              {(chartType === 'all' || chartType === 'deletions') && (
                <Bar dataKey="deletions" fill="#ef4444" opacity={0.7} name="Deletions" />
              )}
              {chartType === 'net' && activeRepos.length > 0 && activeRepos.map((repo, i) => (
                <Bar
                  key={repo}
                  dataKey={repo}
                  stackId="net"
                  fill={REPO_COLORS[i % REPO_COLORS.length]}
                  opacity={0.7}
                  name={repo}
                />
              ))}
              {chartType === 'net' && activeRepos.length === 0 && (
                <Bar dataKey="net" fill="#3b82f6" opacity={0.7} name="Net" />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
