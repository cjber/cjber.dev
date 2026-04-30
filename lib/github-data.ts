import snapshot from './github-data.json'

export type WeekStats = {
  date: string
  weekTimestamp: number
  additions: number
  deletions: number
  net: number
  [repo: string]: string | number | undefined
}

export type CalendarDay = { date: string; count: number; level: number }
export type CalendarWeek = { firstDay: string; days: CalendarDay[] }

export type GitHubSnapshot = {
  generatedAt: string
  weeks: WeekStats[]
  repoNames: string[]
  calendar: { weeks: CalendarWeek[]; totalContributions: number }
}

export const githubSnapshot: GitHubSnapshot = snapshot
