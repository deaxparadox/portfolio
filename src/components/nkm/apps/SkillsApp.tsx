'use client'
import { useState } from 'react'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export function SkillsApp() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="nkm-skills-list">
      {data.skills.map(skill => (
        <div key={skill.name} className="nkm-skill-item">
          <div className="nkm-skill-row" onClick={() => setOpen(open === skill.name ? null : skill.name)}>
            <span className="nkm-skill-ico">{skill.icon}</span>
            <div className="nkm-skill-info">
              <div className="nkm-skill-name">{skill.name}</div>
              <div className="nkm-skill-bar-track">
                <div
                  className="nkm-skill-bar-fill"
                  style={{ width: open === skill.name ? `${skill.pct}%` : '0%' }}
                />
              </div>
            </div>
            <span className="nkm-skill-pct">{skill.pct}%</span>
            <span className={`nkm-skill-chevron ${open === skill.name ? 'open' : ''}`}>›</span>
          </div>
          <div className={`nkm-skill-detail ${open === skill.name ? 'open' : ''}`}>
            <div className="nkm-skill-desc">{skill.description}</div>
            <div className="nkm-skill-tags">
              {skill.tags.map(t => <span key={t} className="nkm-skill-tag">{t}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
