'use client'
import { useMemo } from 'react'
import { generateHeatmapCells } from '@/lib/heatmap'

const CELLS = 52 * 7

export function AboutApp() {
  const cells = useMemo(() => generateHeatmapCells(CELLS), [])

  return (
    <div className="nk-about">
      <div className="nk-about-avatar">👨‍💻</div>
      <div className="nk-about-name">Nitish Kushwaha</div>
      <div className="nk-about-role">Backend &amp; AI Engineer · Gurugram, India</div>
      <div className="nk-about-bio">
        Python developer building production AI systems — multi-tenant voice agents,
        LangGraph pipelines, and full-stack applications deployed across AWS, Azure, and GCP.
      </div>
      <table className="nk-about-tbl">
        <tbody>
          <tr><td>Experience</td><td>3+ years</td></tr>
          <tr><td>Products</td><td>7 shipped</td></tr>
          <tr><td>Automation</td><td>60% boost</td></tr>
          <tr><td>Cloud</td><td>AWS · Azure · GCP</td></tr>
          <tr><td>Status</td><td style={{color:'#56d364'}}>● Available</td></tr>
        </tbody>
      </table>
      <div className="nk-heatmap">
        {Array.from({ length: 52 }, (_, col) => (
          <div key={col} className="nk-heatmap-col">
            {Array.from({ length: 7 }, (_, row) => {
              const level = cells[col * 7 + row]
              return (
                <div
                  key={row}
                  className={`nk-heatmap-cell ${level > 0 ? `l${level}` : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
