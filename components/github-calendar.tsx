import type { CalendarWeek } from '@/lib/github-data'

const LEVEL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] as const

const BLOCK = 11
const GAP = 3
const RADIUS = 2
const WEEKDAY_LABELS = ['Mon', 'Wed', 'Fri'] as const
const WEEKDAY_ROWS = [1, 3, 5] as const
const LEFT_PAD = 28
const TOP_PAD = 18
const FONT = 11

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type Props = {
  weeks: CalendarWeek[]
  totalContributions: number
}

function monthLabels(weeks: CalendarWeek[]) {
  const labels: { x: number; label: string }[] = []
  let prevMonth = -1
  weeks.forEach((week, i) => {
    if (!week.days[0]) return
    const month = new Date(week.days[0].date + 'T00:00:00Z').getUTCMonth()
    if (month !== prevMonth) {
      labels.push({ x: LEFT_PAD + i * (BLOCK + GAP), label: MONTH_NAMES[month] })
      prevMonth = month
    }
  })
  // drop labels too close to neighbour
  return labels.filter((l, i) => i === 0 || l.x - labels[i - 1].x >= 30)
}

export function GitHubCalendar({ weeks, totalContributions }: Props) {
  if (!weeks.length) {
    return (
      <div className="text-xs text-muted-foreground font-mono py-6 text-center">
        Calendar data unavailable
      </div>
    )
  }

  const width = LEFT_PAD + weeks.length * (BLOCK + GAP)
  const height = TOP_PAD + 7 * (BLOCK + GAP)
  const months = monthLabels(weeks)

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label={`${totalContributions} GitHub contributions in the last year`}
        style={{ display: 'block' }}
      >
        <g fill="var(--muted-foreground)" fontSize={FONT} fontFamily="var(--font-mono)">
          {months.map((m) => (
            <text key={m.x + m.label} x={m.x} y={12}>
              {m.label}
            </text>
          ))}
          {WEEKDAY_LABELS.map((label, i) => (
            <text
              key={label}
              x={0}
              y={TOP_PAD + WEEKDAY_ROWS[i] * (BLOCK + GAP) + BLOCK - 1}
            >
              {label}
            </text>
          ))}
        </g>
        <g>
          {weeks.map((week, wi) =>
            week.days.map((day, di) => (
              <rect
                key={day.date}
                x={LEFT_PAD + wi * (BLOCK + GAP)}
                y={TOP_PAD + di * (BLOCK + GAP)}
                width={BLOCK}
                height={BLOCK}
                rx={RADIUS}
                ry={RADIUS}
                fill={LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0]}
              >
                <title>{`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}</title>
              </rect>
            )),
          )}
        </g>
      </svg>
    </div>
  )
}
