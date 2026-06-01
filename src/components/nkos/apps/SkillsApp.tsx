'use client'
// Renders the SkillsFinder widget directly — skips the full-page <section> wrapper
// (which has inline padding:100px that can't be overridden by CSS).
// Also drops sf-dots (redundant KDE traffic lights inside NK-OS window).

import { useState, useRef, useEffect } from 'react'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData
const skills = data.skills

const TAB_LABELS: Record<string, string> = {
  'AI & GenAI': 'AI',
  'Backend APIs': 'Backend',
  'Voice & Realtime': 'Voice',
  'Databases': 'Data',
  'DevOps & Cloud': 'Cloud',
  'Frontend & Tools': 'Frontend',
}

export function SkillsApp() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [animating, setAnimating] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const active = skills[activeIdx]

  const handleSelect = (idx: number) => {
    if (idx === activeIdx) return
    setAnimating(true)
    setTimeout(() => { setActiveIdx(idx); setAnimating(false) }, 150)
  }

  const handleViewToggle = (v: 'list' | 'grid') => {
    if (v === view) return
    setAnimating(true)
    setTimeout(() => { setView(v); setAnimating(false) }, 150)
  }

  useEffect(() => {
    if (!barRef.current) return
    barRef.current.style.width = '0'
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (barRef.current) barRef.current.style.width = `${active.pct}%`
    }))
  }, [activeIdx, view, active.pct])

  const bodyStyle = {
    opacity: animating ? 0 : 1,
    transform: animating ? 'translateY(8px)' : 'none',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    // Override the hardcoded height:480px from globals.css sf-body rule
    height: 'auto',
    flex: 1,
    minHeight: 0,
  }

  return (
    <div className="skills-finder" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 0, boxShadow: 'none', border: 'none' }}>
      {/* Titlebar — sf-dots omitted (NK-OS window already has close/min/max) */}
      <div className="sf-titlebar">
        <div className="sf-title-mid">
          <span className="sf-title-text">📂 Skills &amp; Capabilities</span>
          <em className="sf-title-count">— {skills.length} items</em>
        </div>
        <div className="sf-view-pills">
          <button type="button" className={`sf-pill${view === 'list' ? ' sf-pill-active' : ''}`} onClick={() => handleViewToggle('list')}>List</button>
          <button type="button" className={`sf-pill${view === 'grid' ? ' sf-pill-active' : ''}`} onClick={() => handleViewToggle('grid')}>Grid</button>
        </div>
      </div>

      {/* Body */}
      <div className="sf-body" style={bodyStyle}>
        {view === 'list' ? (
          <>
            <div className="sf-sidebar">
              <div className="sf-sb-label">All Skills</div>
              {skills.map((skill, idx) => (
                <div key={skill.name}>
                  {idx === 3 && <div className="sf-sb-divider" />}
                  <button
                    type="button"
                    className={`sf-sb-item${activeIdx === idx ? ' sf-sb-item-active' : ''}`}
                    onClick={() => handleSelect(idx)}
                  >
                    <div className="sf-sb-icon">{skill.icon}</div>
                    <div className="sf-sb-text">
                      <div className="sf-sb-name">{skill.name}</div>
                      <div className="sf-sb-kind">{skill.kind}</div>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            <div className="sf-tab-row">
              {skills.map((skill, idx) => (
                <button key={skill.name} type="button" className={`sf-tab${activeIdx === idx ? ' sf-tab-active' : ''}`} onClick={() => handleSelect(idx)}>
                  <span className="sf-tab-icon">{skill.icon}</span>
                  <span className="sf-tab-label">{TAB_LABELS[skill.name] ?? skill.name}</span>
                </button>
              ))}
            </div>

            <div className="sf-detail">
              <div className="sf-detail-header">
                <div className="sf-detail-icon">{active.icon}</div>
                <div>
                  <div className="sf-detail-name">{active.name}</div>
                  <div className="sf-detail-kind">{active.kind}</div>
                </div>
              </div>
              <p className="sf-detail-desc">{active.description}</p>
              <div className="sf-prof-row">
                <span className="sf-prof-label">Proficiency</span>
                <div className="sf-prof-track"><div className="sf-prof-fill" ref={barRef} /></div>
                <span className="sf-prof-pct">{active.pct}%</span>
              </div>
              <div className="sf-tags">
                {active.tags.map(tag => <span key={tag} className="sf-tag">{tag}</span>)}
              </div>
            </div>
          </>
        ) : (
          <div className="sf-grid">
            {skills.map(skill => (
              <div key={skill.name} className="sf-card">
                <span className="sf-card-icon">{skill.icon}</span>
                <div className="sf-card-name">{skill.name}</div>
                <div className="sf-card-kind">{skill.kind}</div>
                <div className="sf-card-bar-row">
                  <div className="sf-card-bar-track"><div className="sf-card-bar-fill" style={{ width: `${skill.pct}%` }} /></div>
                  <span className="sf-card-pct">{skill.pct}%</span>
                </div>
                <div className="sf-tags">
                  {skill.tags.map(tag => <span key={tag} className="sf-tag">{tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="sf-statusbar">
        <span className="sf-st-left">{activeIdx + 1} of {skills.length} selected — {active.name}</span>
        <div className="sf-st-right">
          <span className="sf-st-dot" />
          <span className="sf-st-text">Open to work</span>
        </div>
      </div>
    </div>
  )
}
