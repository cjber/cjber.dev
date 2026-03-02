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
  daysWithCommits: number
  repositories: number
}

export function LocChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [chartType, setChartType] = useState<'all' | 'additions' | 'deletions' | 'net'>('net')

  useEffect(() => {
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
  }, [days])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-mono">Lines of Code per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive font-mono">
            Error: {error}
            {error.includes('token') && (
              <div className="mt-2 text-xs text-muted-foreground">
                Please set GITHUB_TOKEN in your environment variables
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-mono">Lines of Code per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground font-mono">
            Loading GitHub statistics...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">Lines of Code per Day</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setDays(7)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                days === 7 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                days === 30 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              30d
            </button>
            <button
              onClick={() => setDays(90)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                days === 90 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              90d
            </button>
            <button
              onClick={() => setDays(365)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                days === 365 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              1y
            </button>
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
              <span className="text-muted-foreground">Active days: </span>
              <span>{summary.daysWithCommits}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Repos: </span>
              <span>{summary.repositories}</span>
            </div>
          </div>
        )}
        
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setChartType('net')}
            className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
              chartType === 'net' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Net
          </button>
          <button
            onClick={() => setChartType('all')}
            className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
              chartType === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setChartType('additions')}
            className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
              chartType === 'additions' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Additions
          </button>
          <button
            onClick={() => setChartType('deletions')}
            className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
              chartType === 'deletions' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Deletions
          </button>
        </div>

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
              interval={Math.floor(data.length / 6)}
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
              labelFormatter={(value) => formatDate(value as string)}
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
      </CardContent>
    </Card>
  )
}