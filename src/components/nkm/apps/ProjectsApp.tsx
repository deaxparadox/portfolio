'use client'
import { useState } from 'react'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData, ProjectItem } from '@/data/types'

const data = portfolioData as PortfolioData

const PROJECT_ICONS: Record<string, string> = {
  'VoiceOps AI': '📞', 'LexCall': '⚖️',
  "Founder's Lab": '🚀', 'Trajectry': '🎯', 'StructureIQ': '🏗️',
}

export function ProjectsApp() {
  const [selected, setSelected] = useState<ProjectItem | null>(null)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div className="nkm-proj-list">
        {data.projects.map(p => (
          <div key={p.name} className="nkm-proj-card" onClick={() => setSelected(p)}>
            <div className="nkm-proj-icon">{PROJECT_ICONS[p.name] ?? '📁'}</div>
            <div className="nkm-proj-info">
              <div className="nkm-proj-name">{p.name}</div>
              <div className="nkm-proj-meta">{p.year} · {p.tags[0]}</div>
            </div>
            <div className="nkm-proj-arr">›</div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="nkm-proj-detail open">
          <button className="nkm-proj-detail-back" onClick={() => setSelected(null)}>‹ Back</button>
          <div style={{ fontSize: 40 }}>{PROJECT_ICONS[selected.name] ?? '📁'}</div>
          <div className="nkm-proj-detail-title">{selected.name}</div>
          <div className="nkm-proj-detail-year">{selected.year}</div>
          <div className="nkm-proj-detail-desc">{selected.description}</div>
          <div className="nkm-proj-tags">
            {selected.tags.map(t => <span key={t} className="nkm-proj-tag">{t}</span>)}
          </div>
          <div className="nkm-proj-stats">
            {selected.visual.stats.map(s => (
              <div key={s.label}>
                <div className="nkm-proj-stat-val">{s.value}</div>
                <div className="nkm-proj-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
          {selected.links[0]?.href !== '#' && (
            <a href={selected.links[0].href} className="nkm-proj-link" target="_blank" rel="noopener noreferrer">
              {selected.links[0].label}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
