'use client'
import { useState } from 'react'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData, ProjectItem } from '@/data/types'

const data = portfolioData as PortfolioData

const CATEGORIES = [
  { id: 'all',      label: '📁 All Projects' },
  { id: 'voice',    label: '🎙️ Voice & Realtime' },
  { id: 'agents',   label: '⚡ AI Agents' },
  { id: 'document', label: '📄 Document AI' },
]

const PROJECT_CAT: Record<string, string> = {
  'VoiceOps AI':   'voice',
  'LexCall':       'voice',
  "Founder's Lab": 'agents',
  'Trajectry':     'agents',
  'StructureIQ':   'document',
}

const PROJECT_ICONS: Record<string, string> = {
  'VoiceOps AI':   '📞',
  'LexCall':       '⚖️',
  "Founder's Lab": '🚀',
  'Trajectry':     '🎯',
  'StructureIQ':   '🏗️',
}

export function ProjectsApp() {
  const [cat, setCat] = useState('all')
  const [selected, setSelected] = useState<ProjectItem | null>(null)

  const projects = data.projects.filter(p =>
    cat === 'all' || PROJECT_CAT[p.name] === cat
  )

  if (selected) {
    return (
      <div className="nk-fm" style={{ position: 'relative' }}>
        <div className="nk-proj-detail">
          <button className="nk-proj-detail-back" onClick={() => setSelected(null)}>
            ‹ Back
          </button>
          <div style={{ fontSize: 40 }}>{PROJECT_ICONS[selected.name] ?? '📁'}</div>
          <div className="nk-proj-detail-title">{selected.name}</div>
          <div className="nk-proj-detail-year">{selected.year}</div>
          <div className="nk-proj-detail-desc">{selected.description}</div>
          <div className="nk-proj-tags">
            {selected.tags.map(t => <span key={t} className="nk-proj-tag">{t}</span>)}
          </div>
          <div className="nk-proj-stats">
            {selected.visual.stats.map(s => (
              <div key={s.label} className="nk-proj-stat">
                <div className="nk-proj-stat-val">{s.value}</div>
                <div className="nk-proj-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
          {selected.links[0] && (
            <a
              href={selected.links[0].href === '#' ? undefined : selected.links[0].href}
              className="nk-proj-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {selected.links[0].label}
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="nk-fm">
      <div className="nk-fm-bdy">
        <div className="nk-fm-sb">
          {CATEGORIES.map(c => (
            <div
              key={c.id}
              className={`nk-fm-si ${cat === c.id ? 'sel' : ''}`}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </div>
          ))}
        </div>
        <div className="nk-fm-files">
          {projects.map(p => (
            <div
              key={p.name}
              className="nk-fm-file"
              onClick={() => setSelected(p)}
            >
              <div className="nk-fm-file-ico">{PROJECT_ICONS[p.name] ?? '📁'}</div>
              <div className="nk-fm-file-nm">{p.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
