'use client'
import { useState, useRef, useEffect } from 'react'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData
const skills = data.skills

const mono = 'var(--nk-mono, monospace)'
const font = 'var(--nk-font, sans-serif)'

export function SkillsApp() {
  const [active, setActive] = useState(0)
  const barRef = useRef<HTMLDivElement>(null)
  const skill = skills[active]

  useEffect(() => {
    if (!barRef.current) return
    barRef.current.style.width = '0'
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (barRef.current) barRef.current.style.width = `${skill.pct}%`
    }))
  }, [active, skill.pct])

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--win-bg)', fontFamily: font }}>

      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0, borderRight: '1px solid rgba(245,197,24,0.12)',
        overflowY: 'auto', padding: '8px 0',
      }}>
        <div style={{ padding: '6px 14px 10px', fontSize: 10, color: 'rgba(245,197,24,0.45)', letterSpacing: '0.14em', fontFamily: mono }}>
          ALL SKILLS
        </div>
        {skills.map((s, i) => (
          <button
            key={s.name}
            type="button"
            onClick={() => setActive(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 14px', border: 'none',
              background: i === active ? 'rgba(245,197,24,0.12)' : 'transparent',
              borderLeft: `2px solid ${i === active ? '#f5c518' : 'transparent'}`,
              cursor: 'pointer', textAlign: 'left', transition: 'background .12s',
              fontFamily: font,
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: i === active ? '#f5c518' : 'var(--text)' }}>
                {s.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1, lineHeight: 1.4 }}>
                {s.kind}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, background: 'rgba(245,197,24,0.09)',
            border: '1px solid rgba(245,197,24,0.22)',
          }}>
            {skill.icon}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2, fontFamily: mono }}>
              {skill.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(245,197,24,0.60)', letterSpacing: '0.08em', marginTop: 4, fontFamily: mono }}>
              {skill.kind.split(' · ').map(k => k.toUpperCase()).join(' · ')}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.75, margin: 0 }}>
          {skill.description}
        </p>

        {/* Proficiency */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: 'rgba(245,197,24,0.50)', letterSpacing: '0.12em', fontFamily: mono }}>
              PROFICIENCY
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#f5c518', fontFamily: mono }}>
              {skill.pct}%
            </span>
          </div>
          <div style={{ height: 4, background: 'rgba(245,197,24,0.12)', borderRadius: 2, overflow: 'hidden' }}>
            <div
              ref={barRef}
              style={{ height: '100%', background: 'linear-gradient(90deg,#c49a00,#f5c518)', borderRadius: 2, width: 0, transition: 'width 0.6s cubic-bezier(.4,0,.2,1)' }}
            />
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {skill.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 20, fontFamily: mono,
              background: 'rgba(245,197,24,0.10)', color: '#f5c518',
              border: '1px solid rgba(245,197,24,0.22)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
