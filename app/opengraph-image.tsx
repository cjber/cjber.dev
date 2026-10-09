import { ImageResponse } from 'next/og'
import { PROFILE } from '@/lib/cv'

export const dynamic = 'force-static'
export const alt = `${PROFILE.name}, ${PROFILE.title} at ${PROFILE.employer.name}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 96,
          background: '#111113',
          color: '#a3a3a3',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, color: '#e58a55' }}>{PROFILE.name}</div>
        <div style={{ display: 'flex', fontSize: 40, marginTop: 24 }}>
          {PROFILE.title} @ <span style={{ color: '#6fa3a0', marginLeft: 16 }}>{PROFILE.employer.name}</span>
        </div>
        <div style={{ fontSize: 30, marginTop: 48, color: '#737373' }}>
          AI agents and the systems that run them. Author of fastbrowse.
        </div>
        <div style={{ fontSize: 28, marginTop: 72, color: '#525252' }}>cillian.dev</div>
      </div>
    ),
    size,
  )
}
