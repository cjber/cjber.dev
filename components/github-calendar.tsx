'use client'

import GitHubCalendar from 'react-github-calendar'

const theme = {
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
}

export function GitHubCalendarWrapper() {
  return (
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
  )
}
