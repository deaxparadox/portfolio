'use client'
import { useMemo } from 'react'
import { generateHeatmapCells } from '@/lib/heatmap'

const MONTHS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May']

export default function BentoHeatmap() {
  const cells = useMemo(() => generateHeatmapCells(52 * 7), [])

  return (
    <div className="bc bc-github">
      <div className="bc-label">GitHub Contributions</div>
      <div className="bc-title">Coding throughout the year</div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Open source journey &amp; contributions
      </div>
      <div className="heatmap" style={{ overflow: 'hidden' }}>
        {cells.map((lv, i) => (
          <div key={i} className={`hm-cell${lv ? ` l${lv}` : ''}`} />
        ))}
      </div>
      <div className="hm-months" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '.04em' }}>
        {MONTHS.map(m => <span key={m}>{m}</span>)}
      </div>
    </div>
  )
}
