'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
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
  summary: Summary
}

interface LocChartProps {
  initialData: StatsResponse | null
}

export function LocChart({ initialData }: LocChartProps) {
  const [data, setData] = useState<ChartData[]>(initialData?.stats ?? [])
  const [summary, setSummary] = useState<Summary | null>(initialData?.summary ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialData ? null : 'Failed to load stats')
  const [days, setDays] = useState(90)
  const [chartType, setChartType] = useState<'all' | 'additions' | 'deletions' | 'net'>('net')

  useEffect(() => {
    if (days === 90 && initialData) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/github-stats-direct?days=${days}&username=cjber`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch data')
        }

        const result = await response.json()
        setData(result.stats)
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
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdditions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDeletions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                labelFormatter={(value) => `Week of ${formatDate(value as string)}`}
                formatter={(value: number) => formatNumber(value)}
              />
              {(chartType === 'all' || chartType === 'additions') && (
                <Area
                  type="monotone"
                  dataKey="additions"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorAdditions)"
                  name="Additions"
                />
              )}
              {(chartType === 'all' || chartType === 'deletions') && (
                <Area
                  type="monotone"
                  dataKey="deletions"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorDeletions)"
                  name="Deletions"
                />
              )}
              {chartType === 'net' && (
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorNet)"
                  name="Net"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
