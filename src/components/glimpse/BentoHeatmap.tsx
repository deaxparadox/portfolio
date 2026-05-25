'use client'
import { useMemo } from 'react'

const MONTHS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May']
const WEIGHTS = [.35, .25, .2, .12, .08]

export default function BentoHeatmap() {
  const cells = useMemo(() => {
    return Array.from({ length: 52 * 7 }, () => {
      let acc = 0, lv = 0
      const r = Math.random()
      for (let j = 0; j < WEIGHTS.length; j++) {
        acc += WEIGHTS[j]
        if (r < acc) { lv = j; break }
      }
      return lv
    })
  }, [])

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
