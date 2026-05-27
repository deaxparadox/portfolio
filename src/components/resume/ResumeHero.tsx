// src/components/resume/ResumeHero.tsx
'use client'
import { useMemo } from 'react'
import { generateHeatmapCells } from '@/lib/heatmap'
import type { ThemeTokens } from './types'

const mono = "'DM Mono', monospace"
const sans = "'Syne', sans-serif"
const dirt = "'Rubik Dirt', sans-serif"
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface Props {
  T: ThemeTokens
  name: string
  role: string
  location: string
  bio: string[]
  tldr: string
}

export default function ResumeHero({ T, name, role, location, bio, tldr }: Props) {
  const cells = useMemo(() => generateHeatmapCells(52 * 7), [])
  const heatLevels = [
    T.bgTerm === 'rgba(245,197,24,0.04)' ? 'rgba(245,197,24,0.07)' : 'rgba(0,0,0,0.07)',
    T.bgTerm === 'rgba(245,197,24,0.04)' ? 'rgba(245,197,24,0.24)' : 'rgba(0,0,0,0.22)',
    T.bgTerm === 'rgba(245,197,24,0.04)' ? 'rgba(245,197,24,0.46)' : 'rgba(0,0,0,0.42)',
    T.bgTerm === 'rgba(245,197,24,0.04)' ? 'rgba(245,197,24,0.70)' : 'rgba(0,0,0,0.66)',
    T.bgTerm === 'rgba(245,197,24,0.04)' ? T.gold : 'rgba(0,0,0,0.90)',
  ]

  return (
    <section style={{ paddingTop: 60 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontFamily: mono, fontSize: 10, color: T.dim,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        marginBottom: 24, background: T.bgTerm,
        border: `1px solid ${T.border}`, padding: '5px 12px', borderRadius: 4,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'rp-pulse 2s ease-in-out infinite', display: 'inline-block' }} />
        Available for work
      </div>

      <h1 style={{
        fontFamily: dirt, fontSize: 'clamp(38px,6vw,64px)',
        color: T.txt, lineHeight: 0.95, letterSpacing: '-1px',
        marginBottom: 10, transition: 'color .35s',
      }}>{name}</h1>

      <div style={{
        fontFamily: mono, fontSize: 13, color: T.dim,
        letterSpacing: '0.05em', marginBottom: 30,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        transition: 'color .35s',
      }}>
        <span style={{ color: T.gold, fontWeight: 500 }}>{role}</span>
        <span style={{ color: T.border }}>•</span>
        <span>{location}</span>
      </div>

      {bio.map((p, i) => (
        <p key={i} style={{ fontSize: 14, color: T.dim, lineHeight: 1.85, maxWidth: 560, marginBottom: 16, fontFamily: sans, transition: 'color .35s' }}>{p}</p>
      ))}

      <p style={{
        fontFamily: mono, fontSize: 12, color: T.dimLo,
        lineHeight: 1.75, maxWidth: 520, marginBottom: 40,
        paddingLeft: 14, borderLeft: `2px solid ${T.border}`,
        transition: 'color .35s, border-color .35s',
      }}>
        <span style={{ color: T.gold }}>tldr;</span>{' '}{tldr}
      </p>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {MONTHS.map(m => (
            <span key={m} style={{ fontFamily: mono, fontSize: 9, color: T.dimLo, letterSpacing: '0.04em' }}>{m}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52,1fr)', gridTemplateRows: 'repeat(7,1fr)', gap: 3 }}>
          {cells.map((lv, i) => (
            <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 2, background: heatLevels[lv] }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: mono, fontSize: 9, color: T.dimLo }}>Less</span>
          {heatLevels.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
          <span style={{ fontFamily: mono, fontSize: 9, color: T.dimLo }}>More</span>
        </div>
      </div>
    </section>
  )
}
