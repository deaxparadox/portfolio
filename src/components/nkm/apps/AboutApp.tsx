'use client'
import { useMemo } from 'react'
import { generateHeatmapCells } from '@/lib/heatmap'

export function AboutApp() {
  const cells = useMemo(() => generateHeatmapCells(52 * 7), [])

  return (
    <div className="nkm-about">
      <div className="nkm-about-avatar">👨‍💻</div>
      <div className="nkm-about-name">Nitish Kushwaha</div>
      <div className="nkm-about-role">Backend &amp; AI Engineer · Gurugram, India</div>
      <div className="nkm-about-bio">
        Python developer building production AI systems — multi-tenant voice agents,
        LangGraph pipelines, and full-stack applications deployed across AWS, Azure, and GCP.
      </div>
      <div className="nkm-stats-row">
        {[['3+','Years Exp'],['7','Products'],['60%','Automation'],['3','Clouds']].map(([v,l]) => (
          <div key={l} className="nkm-stat-card">
            <div className="nkm-stat-val">{v}</div>
            <div className="nkm-stat-lbl">{l}</div>
          </div>
        ))}
      </div>
      <div className="nkm-heatmap">
        {Array.from({ length: 52 }, (_, col) => (
          <div key={col} className="nkm-heatmap-col">
            {Array.from({ length: 7 }, (_, row) => {
              const level = cells[col * 7 + row]
              return <div key={row} className={`nkm-heatmap-cell ${level > 0 ? `l${level}` : ''}`} />
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
